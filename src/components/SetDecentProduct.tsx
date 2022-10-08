import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { utils } from 'ethers';
import { getContractData } from "@/lib/utils/decent";

const SetDecentProduct = ({ setDecentProduct }) => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const [contractAddress, setContractAddress] = useState();

  const onContractAddressChanged = (event) => {
    const val = event.target.value;
    if (utils.isAddress(val)) {
      _getContractData(val);
    }
  };

  const _getContractData = async (address) => {
    const { data } = await getContractData(address, chain.id, signer);
    setDecentProduct(data);
  };

  return (
    <div>
      <form>
        <div class="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label for="contract_address" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Your Decent NFT Address</label>
            <input
              type="text"
              id="contract_address"
              class="bg-gray-50 border"
              placeholder="0x"
              required
              onChange={onContractAddressChanged}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default SetDecentProduct;
