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
    <div className="w-full">
      <form className="w-full">
        <div className="w-full">
          <div className="w-full flex flex-col gap-4">
            <label htmlFor="contract_address" className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
              Your Decent NFT Address
            </label>
            <input
              type="text"
              id="contract_address"
              className="input"
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
