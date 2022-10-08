import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from '@/components/SetDecentProduct';
import { IPlaylist } from "@spinamp/spinamp-sdk";
import SetGoodyBag from "@/components/SetGoodyBag";
import { useState } from "react";

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
    setLensPost(postData)
  }

  const setGoodyBag = (uri) => {
    setUri(uri)
    console.log(uri)
  }

  const submit = () => {
    // TODO: send all api calls
  };

  return (
    <div className="">
      <p>Create a Space</p>
      {!playlist ? <SelectPlaylist selectPlaylist={selectPlaylist} /> : <p>Playlist: {playlist.title}</p>}
      {!productData ? <SetDecentProduct setDecentProduct={setDecentProduct} /> : <p>NFT FOUND! RENDER AN NFT COMPONENT</p>}
      {!lensPost ? <CreateLensPost setPostData={setPostData}/> : <div>
        <p>Lens Post:</p>
        <p>{lensPost}</p>
      </div> }
      {!uri ? <SetGoodyBag setGoodyBag={setGoodyBag}/> : <p>GoodyBag URI: {uri}</p>}
    </div>
  );
};

export default CreateSpace;
