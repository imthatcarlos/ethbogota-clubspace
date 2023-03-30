import { useMemo, useState } from "react";
import { utils } from "ethers";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSigner } from "wagmi";
import { getUrlForImageFromIpfs, approveToken } from "@/utils";
import { getPost } from "@/services/lens/getPost";
import { collectPostGasless } from "@/services/lens/gaslessTxs";
import { getAccessToken } from "@/hooks/useLensLogin";

const PinnedLensPost = ({ url, small, renderHeader = true, renderCollectButton = false, gated, onCollect }) => {
  const { data: signer } = useSigner();
  const [lensPost, setLensPost] = useState(null);
  const [lensPubId, setLensPubId] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);

  useMemo(async () => {
    const parts = url.split("/");
    const pubId = parts[parts.length - 1];
    const post = await getPost(pubId);
    setLensPubId(pubId);
    setLensPost(post);
  }, [url]);

  const collect = async () => {
    setIsCollecting(true);

    let toastId;
    try {
      toastId = toast.loading('Collecting post...');

      // if the allowance against the module is less than the fee, approve more
      await approveToken(
        gated.collectCurrency.address,
        gated.collectFee,
        signer,
        lensPost.collectModule.contractAddress
      );

      // collect the post by signing and broadcasting
      await collectPostGasless(lensPubId, signer, getAccessToken());

      toast.dismiss(toastId);
      toast.success('Post collected! You can join the ClubSpace when the tx is settled', { duration: 10_000 });

      onCollect();
    } catch (error) {
      console.log(error);
      toast.dismiss(toastId);
      toast.error('Error collecting post');
    }

    setIsCollecting(false);
  };

  if (small) {
    return (
      <>
        <div className="rounded-md w-[20rem] max-h-[7.6rem] bg-black m-auto p-3 drop-shadow-sm">
          <a href={url} className="" target="_blank" referrerPolicy="no-referrer">
            <div className="flex mb-3">
              <span className="text-gray-500 ml-1">@{lensPost?.profile.handle}</span>
            </div>
            <p className="mb-2 truncate max-h-[12rem] ">{lensPost?.metadata.content}</p>
            <p className="text-xs text-[#845eee]">See on Lenster</p>
          </a>
        </div>
      </>
    );
  }

  return (
    <>
      {renderHeader && (
        <h2 className="my-4 text-4xl font-bold tracking-tight sm:text-2xl md:text-5xl drop-shadow-sm text-center drop-shadow-sm">
          Pinned Lens Post
        </h2>
      )}
      <div className="rounded-md max-w-[30rem] bg-black m-auto p-6 space-y-6">
        <a href={url} className="" target="_blank" referrerPolicy="no-referrer">
          <div className="flex items-center space-x-4 mb-4">
            <Image
              src={getUrlForImageFromIpfs(lensPost?.profile.picture.original.url) ?? "/anon.png"}
              alt="Profile Picture"
              height={40}
              width={40}
              className="object-cover rounded-full"
              loading="lazy"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{lensPost?.profile.name || ''}</span>
              <span className="text-gray-500 text-md mb-2">@{lensPost?.profile.handle}</span>
            </div>
          </div>
          <p className="whitespace-pre-wrap text-white max-h-[10rem] overflow-scroll mb-2 leading-7">{lensPost?.metadata.content}</p>
          <div className={`grid ${lensPost?.metadata.media.length > 1 ? "grid-cols-2" : ""} gap-2`}>
            {lensPost?.metadata.media?.map((media) => (
              <img
                src={getUrlForImageFromIpfs(media.original.url) ?? "/anon.png"}
                alt="Media"
                key={media.original.url}
                className={`object-cover rounded-sm w-full ${lensPost?.metadata.media.length > 1 ? "h-20" : "h-full"}`}
                loading="lazy"
              />
            ))}
          </div>
        </a>
      </div>
      <div className="flex justify-center mt-4 mb-4 text-sm gap-x-4">
        <div className="flex gap-x-2">
          <span>
            <strong>
              {lensPost?.stats.totalAmountOfCollects}
            </strong>
          </span>
          <span className="text-gray-400">Collected</span>
        </div>

        {gated && (
          <div className="flex gap-x-2">
            <span>
              <strong>{gated.collectFee}</strong>
            </span>
            <span className="text-gray-400">{gated.collectCurrency.symbol}</span>
          </div>
        )}
      </div>
      {gated ? (
        <div className="text-center my-3 px-3 w-60 mx-auto">
          <button className="!w-full btn" onClick={collect} disabled={isCollecting}>
            {parseFloat(gated.collectFee) === 0 ? "Free Collect" : "Collect"}{" "}
          </button>
        </div>
      ) : null}
    </>
  );
};

export default PinnedLensPost;
