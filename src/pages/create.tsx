import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from '@/components/SetDecentProduct';
import { useState } from "react";

const CreateSpace = () => {
  const [playlist, setPlaylist] = useState<any>();
  const [productData, setProductData] = useState<any>();
  const [step, setStep] = useState(0);

  const selectPlaylist = (playlist) => {
    setPlaylist(playlist);
    setStep(1);
  };

  const setDecentProduct = (data) => {
    setProductData(data);
    setStep(2);
  };

  const submit = () => {
    // TODO: send all api calls
  };

  return (
    <div className="">
      <p>Create a Space</p>
      {step === 0 ? <SelectPlaylist selectPlaylist={selectPlaylist} /> : <p>Playlist: {playlist.title}</p>}
      {step === 1 ? <SetDecentProduct setDecentProduct={setDecentProduct} /> : <p>some nice component</p>}

    </div>
  );
};

export default CreateSpace;
