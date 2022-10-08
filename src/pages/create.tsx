import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from "@/components/SetDecentProduct";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import axios from "axios";
import { createGroup } from "@/lib/semaphore/semaphore";

const CreateSpace = ({ defaultProfile }) => {
  const { address } = useAccount();
  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [goody, setGoody] = useState<any>();
  const [uploading, setUploading] = useState<boolean>();
  const [shareUrl, setShareUrl] = useState<string>();

  const selectPlaylist = (playlist) => {
    setPlaylist(playlist);
  };

  const setDecentProduct = (data) => {
    console.log(data);
    setProductData(data);
  };

  const setPostData = (postData) => {
    setLensPost(postData);
  };

  const uploadToIPFS = async () => {
    // pick out files
    const music = goody.files.find((f) => f.path.endsWith(".wav") || f.path.endsWith(".mp3"));
    const cover = goody.files.find(
      (f) => f.path.endsWith(".png") || f.path.endsWith(".gif") || f.path.endsWith(".jpeg") || f.path.endsWith(".jpg")
    );

    // upload to ipfs
    console.log("uploading files");
    const _music = await pinFileToIPFS(music);
    const _image = await pinFileToIPFS(cover);

    console.log("uploading metadata");
    const metadata: any = await pinJson({
      name: goody.name,
      description: goody.description,
      image: `ipfs://${_image.IpfsHash}`,
      animation_url: `ipfs://${_music.IpfsHash}`,
      external_url: "https://joinclubspace.xyz",
    });

    return `ipfs://${metadata.IpfsHash}`;
  };

  const submit = async () => {
    setUploading(true);
    console.log(playlist, productData, lensPost, goody);

    // upload content to ipfs
    const goodyUri = await uploadToIPFS();
    console.log("goody uri:", goodyUri);

    //create lens post
    const lensPubId = ""; // TODO: post to lens

    // call redis api
    const spaceData = {
      creatorAddress: address,
      creatorLensHandle: defaultProfile.handle,
      creatorLensProfileId: defaultProfile.id,
      spinampPlaylistId: playlist.id,
      decentContractAddress: productData.address,
      decentContractChainId: 80001,
      lensPubId,
    };
    const { data } = await axios.post(`/space/create`, spaceData);
    const { url, semGroupIdHex } = data;

    // call sempahore/create-group
    await createGroup(semGroupIdHex, goodyUri, lensPubId, defaultProfile.id);

    setUploading(false);

    // show share button
    setShareUrl(url);
  };

  if (shareUrl) {
    return (
      <div>
        <h2 className="mt-4 mb-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">You did it!</h2>
        {shareUrl}
      </div>
    );
  }

  return (
    <div className="">
      {!playlist ? <SelectPlaylist selectPlaylist={selectPlaylist} /> : <p>Playlist: {playlist.title}</p>}
      {!productData ? (
        <SetDecentProduct setDecentProduct={setDecentProduct} />
      ) : (
        <p>NFT FOUND! RENDER AN NFT COMPONENT</p>
      )}
      <div>
        <CreateLensPost setPostData={setPostData} defaultProfile={defaultProfile} />
      </div>
      <SetGoodyBag setGoody={setGoody} />

      <button
        className="flex w-36 mt-4 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        onClick={submit}
        disabled={!goody || !playlist || !lensPost || !productData || uploading}
      >
        {uploading ? "Loading..." : "Create Party"}
      </button>
    </div>
  );
};

export default CreateSpace;
