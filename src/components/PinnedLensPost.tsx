import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useNetwork, useSigner, useSwitchNetwork } from "wagmi";
// import { Publication, Theme } from "@lens-protocol/widgets-react";
import { Publication, Theme } from "@imthatcarlos/widgets-react";
import { approveToken, parsePublicationLink, wait } from "@/utils";
import { getPost } from "@/services/lens/getPost";
import { collectPostGasless } from "@/services/lens/gaslessTxs";
import { getAccessToken } from "@/hooks/useLensLogin";
import {
  MULTIRECIPIENT_COLLECT_MODULE,
  REWARD_ENGAGEMENT_ACTION_MODULE,
  LENS_CHAIN_ID,
  MADFI_SITE_URL
} from "@/lib/consts";
import { useIsAuthenticated, useLensLogin, useAuthenticatedProfileId } from "@/hooks/useLensLogin";
import getPublicationRewarded from "@/services/madfi/getPublicationRewarded";
import { getPublicationActionParams } from "@/services/madfi/rewardEngagementAction";
import { useIsProfileManager } from '@/services/lens/profileManagers';
import processAct from "@/services/lens/act";
import { LENS_ENVIRONMENT } from "@/services/lens/client";
import { LivePoints } from "./live/LivePoints";

const PinnedLensPost = ({
  url,
  small,
  renderHeader = true,
  renderCollectButton = false,
  gated = null,
  onCollect = () => null,
  onClick = () => null,
  pubData,
}) => {
  const router = useRouter();
  const { data: signer } = useSigner();
  const { chain } = useNetwork();
  const { data: isAuthenticated, refetch: fetchIsAuthenticated } = useIsAuthenticated();
  const { refetch: loginWithLens } = useLensLogin();
  const { data: authenticatedProfileId } = useAuthenticatedProfileId();
  const { switchNetworkAsync } = useSwitchNetwork({ onSuccess: (data) => onActButtonClick(true) });
  const { data: isProfileManager } = useIsProfileManager(authenticatedProfileId, REWARD_ENGAGEMENT_ACTION_MODULE);

  const [lensPost, setLensPost] = useState(null);
  const [lensPubId, setLensPubId] = useState(null);
  const [pubRewarded, setPubRewarded] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);

  useMemo(async () => {
    const pubId = parsePublicationLink(url);
    setLensPubId(pubId);

    if (pubData) {
      setLensPost(pubData);
    } else {
      const post = await getPost(pubId);

      if ((post?.profile || post?.by) && post?.metadata) {
        if (post?.by) post.profile = post.by; // HACK
        setLensPost(post);
      }
    }
  }, [url, pubData]);

  useMemo(async () => {
    const [profileIdHex, pubIdHex] = parsePublicationLink(url).split("-");
    if (!(profileIdHex && pubIdHex)) return;

    const pub = await getPublicationRewarded(profileIdHex, pubIdHex);
    setPubRewarded(pub);
  }, [url]);

  const goToPublicationPage = () => {
    window.open(`${MADFI_SITE_URL}/posts/${lensPubId}`, '_blank');
  }

  const actButtonCTA = useMemo(() => {
    if (!(lensPost && pubRewarded)) return null;

    // TODO: handle our other modules
    const actionModule = lensPost
      .openActionModules
      .find(({ contract }) => contract.address.toLowerCase() === REWARD_ENGAGEMENT_ACTION_MODULE.toLowerCase());

    if (!actionModule) return null;
    if (!isAuthenticated) return "Sign-in with Lens";
    if (!isProfileManager) return "Must enable rewards";

    return `${pubRewarded.actionType} for ${pubRewarded.rewardUnits} MADx`;
  }, [isAuthenticated, lensPost, pubRewarded, isProfileManager]);

  const collect = async () => {
    setIsCollecting(true);

    // HACK: for some reason the address isn't coming back in on polygon...
    const moduleAddress = lensPost.collectModule.contractAddress || MULTIRECIPIENT_COLLECT_MODULE;

    let toastId;
    try {
      toastId = toast.loading("Collecting post...");

      // if the allowance against the module is less than the fee, approve more
      await approveToken(gated.collectCurrency.address, gated.collectFee, signer, moduleAddress);

      // collect the post by signing and broadcasting
      await collectPostGasless(lensPubId, signer, await getAccessToken());

      toast.dismiss(toastId);
      toast.success("Post collected! You can join the ClubSpace when the tx is settled", { duration: 10_000 });

      onCollect();
    } catch (error) {
      console.log(error);
      toast.dismiss(toastId);
      toast.error("Error collecting post");
    }

    setIsCollecting(false);
  };

  const onActButtonClick = async (switched = false) => {
    if (!switched && LENS_CHAIN_ID !== chain.id) {
      toast("Switching chains...");
      try {
        await switchNetworkAsync(LENS_CHAIN_ID);
      } catch {}
      return;
    } else if (switched) {
      await wait(1000);
    }

    if (!isAuthenticated) {
      await loginWithLens();
      fetchIsAuthenticated();
      return;
    }

    if (!isProfileManager) {
     return;
    }

    let loadingMessage: string;
    if (pubRewarded.actionType === "MIRROR") loadingMessage = "Mirroring";

    let toastId;
    try {
      toastId = toast.loading(`${loadingMessage}...`);

      const params = getPublicationActionParams(
        pubRewarded.profileId,
        pubRewarded.pubId,
        authenticatedProfileId,
        pubRewarded.actionType
      );

      await processAct(signer, params);

      toast.success(`Done! You just got ${pubRewarded.rewardUnits} MADx`, { duration: 5_000, id: toastId });
    } catch (error) {
      console.log(error);
      toast.dismiss(toastId);
      toast.error(`Error with ${loadingMessage}`);
    }
  };

  const onShareButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(`${MADFI_SITE_URL}/posts/${lensPubId}`);

    toast("Link copied to clipboard", { position: "bottom-center", icon: "🔗", duration: 2000 });
  };

  if (small && lensPost) {
    return (
      <>
        <div onClick={onClick} className="rounded-t-2xl w-[20rem] max-h-[7.6rem] bg-black m-auto p-4 -mt-4 drop-shadow-sm cursor-pointer">
          <div className="flex mb-3">
            <span className="text-gray-500">Sponsored Post by @{lensPost?.profile?.handle.localName}</span>
          </div>
          <p className="mb-2 truncate max-h-[2.5rem] pb-1 overflow-hidden line-clamp-2">{lensPost?.metadata?.content}</p>
          <p className="text-xs text-[#845eee] absolute right-4 bottom-2">See more</p>
        </div>
      </>
    );
  }

  return (
    <>
      {renderHeader && (
        <h2 className="my-4 text-3xl font-bold tracking-tight sm:text-2xl md:text-4xl drop-shadow-sm text-center drop-shadow-sm">
          Sponsored Post
        </h2>
      )}
      <div className="flex justify-center pt-8 mb-4 text-sm gap-x-4">
        {lensPost && (
          <Publication
            publicationData={lensPost}
            publicationId={lensPubId}
            theme={Theme.dark}
            environment={LENS_ENVIRONMENT}
            onClick={goToPublicationPage}
            onShareButtonClick={onShareButtonClick}
            // renderActButtonWithCTA={actButtonCTA}
            // onActButtonClick={() => onActButtonClick(false)}
          />
        )}
      </div>
      <div className="flex justify-center mt-4 mb-4 text-sm gap-x-4 pb-8">
        {/** NOT SHOWING THIS TILL WE KNOW THE CRETAOR HAS A MAD SBT BADGE */}
        {/* <div className="absolute right-8 bottom-2">
          <LivePoints creatorAddress={lensPost?.profile?.ownedBy?.address.toLowerCase()} isAuthenticated={isAuthenticated} />
        </div> */}
      </div>
      {lensPost && (
        <>
          <div className="flex justify-center mt-4 mb-4 text-sm gap-x-4">
            {(gated || renderCollectButton) && (
              <>
                <div className="flex gap-x-2">
                  <span>
                    <strong>{lensPost?.stats.totalAmountOfCollects}</strong>
                  </span>
                  <span className="text-gray-400">Collected</span>
                </div>
                <div className="flex gap-x-2">
                  <span>
                    <strong>{gated.collectFee}</strong>
                  </span>
                  <span className="text-gray-400">{gated.collectCurrency.symbol}</span>
                </div>
              </>
            )}
          </div>
          {(gated || renderCollectButton) ? (
            <div className="text-center my-3 px-3 w-60 mx-auto">
              <button className="!w-full btn" onClick={collect} disabled={isCollecting}>
                {parseFloat(gated.collectFee) === 0 ? "Free Collect" : "Collect"}{" "}
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
};

export default PinnedLensPost;
