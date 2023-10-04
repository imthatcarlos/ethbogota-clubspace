import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSigner } from "wagmi";
import { Publication, Theme } from "@lens-protocol/widgets-react";
import { approveToken, parsePublicationLink } from "@/utils";
import { getPost } from "@/services/lens/getPost";
import { collectPostGasless } from "@/services/lens/gaslessTxs";
import { getAccessToken } from "@/hooks/useLensLogin";
import { MULTIRECIPIENT_COLLECT_MODULE } from "@/lib/consts";

const PinnedLensPost = ({
  url,
  small,
  renderHeader = true,
  renderCollectButton = false,
  gated = null,
  onCollect = () => null,
}) => {
  const { data: signer } = useSigner();
  const [lensPost, setLensPost] = useState(null);
  const [lensPubId, setLensPubId] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);

  useMemo(async () => {
    if (url.includes("DA")) return; // da posts are not collectable

    const pubId = parsePublicationLink(url);
    const post = await getPost(pubId);

    if (post?.profile && post?.metadata) {
      setLensPubId(pubId);
      setLensPost(post);
    }
  }, [url]);

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
      await collectPostGasless(lensPubId, signer, getAccessToken());

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

  if (small && lensPost) {
    return (
      <>
        <div className="rounded-md w-[20rem] max-h-[7.6rem] bg-black m-auto p-3 drop-shadow-sm">
          <a href={url} className="" target="_blank" referrerPolicy="no-referrer">
            <div className="flex mb-3">
              <span className="text-gray-500 ml-1">@{lensPost?.profile?.handle}</span>
            </div>
            <p className="mb-2 truncate max-h-[12rem] ">{lensPost?.metadata?.content}</p>
            <p className="text-xs text-[#845eee]">See on Lenster</p>
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      {renderHeader && (
        <h2 className="my-4 text-3xl font-bold tracking-tight sm:text-2xl md:text-4xl drop-shadow-sm text-center drop-shadow-sm">
          Pinned Lens Post
        </h2>
      )}
      <div className="flex justify-center mt-4 mb-4 text-sm gap-x-4">
        <Publication
          publicationId={parsePublicationLink(url)}
          theme={Theme.dark}
        />
      </div>
      {lensPost && (
        <>
          <div className="flex justify-center mt-4 mb-4 text-sm gap-x-4">
            <div className="flex gap-x-2">
              <span>
                <strong>{lensPost?.stats.totalAmountOfCollects}</strong>
              </span>
              <span className="text-gray-400">Collected</span>
            </div>

            {(gated || renderCollectButton) && (
              <div className="flex gap-x-2">
                <span>
                  <strong>{gated.collectFee}</strong>
                </span>
                <span className="text-gray-400">{gated.collectCurrency.symbol}</span>
              </div>
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
