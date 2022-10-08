import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from "@/components/SetDecentProduct";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import SetGoodyBag from "@/components/SetGoodyBag";

const CreateSpace = () => {
  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [uri, setUri] = useState<any>()

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

  const setGoodyBag = (uri) => {
    setUri(uri);
    console.log(uri);
  };

  const submit = () => {
    // TODO: send all api calls
    console.log(
      playlist,
      productData,
      lensPost,
      uri
    )
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
      {!uri ? <SetGoodyBag setGoodyBag={setGoodyBag} /> : <p>GoodyBag URI: {uri}</p>}

      <button
          className="flex w-36 mt-4 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={submit}
          disabled={!uri || !playlist || !lensPost || !productData}
        >
          Create Party
        </button>
    </div>
  );
};

export default CreateSpace;
