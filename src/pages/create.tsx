import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from "@/components/SetDecentProduct";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";

const CreateSpace = ({ defaultProfile }) => {
  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [goody, setGoody] = useState<any>();
  const [uploading, setUploading] = useState<boolean>()

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
    console.log('uploading files')
    const _music = await pinFileToIPFS(music);
    const _image = await pinFileToIPFS(cover);

    console.log('uploading metadata')
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
    setUploading(true)
    console.log(playlist, productData, lensPost, goody);

    // TODO: send all api calls
    const goodyUri = await uploadToIPFS()
    console.log(goodyUri)

    setUploading(false)
  };

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
