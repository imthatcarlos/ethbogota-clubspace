import { utils } from "ethers";
import toast from "react-hot-toast";
import getSoundNFT from "@/services/sound/getSoundNFT";

export default ({ soundProduct, setSoundProduct }) => {
  const onContractChanged = async () => {
    const val = event.target.value;

    if (utils.isAddress(val)) {
      const data = await getSoundNFT(val);
      console.log(data);

      if (!data) {
        toast.error('Sound edition contract not found');
      }
    }
  };

  return (
    <>
      <input
        value={soundDrop?.name}
        type="text"
        id="sound_drop"
        className="input"
        placeholder="Paste your contract address here (0x)"
        onChange={(onContractChanged)}
      />
    </>
  )
};
