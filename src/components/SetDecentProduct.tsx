import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { utils } from "ethers";
import { getContractData } from "@/lib/utils/decent";

const SetDecentProduct = ({ setDecentProduct }) => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

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
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label htmlFor="contract_address" className="block text-sm">
              Your Decent NFT Address
            </label>
            <input
              type="text"
              id="contract_address"
              className="block w-fullI rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
