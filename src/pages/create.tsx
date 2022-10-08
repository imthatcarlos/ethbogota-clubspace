import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from '@/components/SetDecentProduct';
import { useState } from "react";

const CreateSpace = () => {
  const [playlist, setPlaylist] = useState<any>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();

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

  const submit = () => {
    // TODO: send all api calls
  };

  return (
    <div className="">
      <p>Create a Space</p>
      {!playlist ? <SelectPlaylist selectPlaylist={selectPlaylist} /> : <p>Playlist: {playlist.title}</p>}
      {!productData ? <SetDecentProduct setDecentProduct={setDecentProduct} /> : <p>NFT FOUND! RENDER AN NFT COMPONENT</p>}
      {!lensPost ? <CreateLensPost setPostData={setPostData}/> : null }
    </div>
  );
};

export default CreateSpace;
