import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { utils } from "ethers";
import { getContractData } from "@/services/decent/getDecentNFT";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";

const SetDecentProduct = ({ setDecentProduct, productData = undefined }) => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();

  const onContractAddressChanged = (event) => {
    const val = event.target.value;
    if (utils.isAddress(val)) {
      _getContractData(val);
    }
  };

  const _getContractData = async (address) => {
    const data = await getContractData(address, chain.id, signer);
    setDecentProduct({ address, ...data });
  };

  return (
    <MultiStepFormWrapper>
      <div className="w-full">
        <div className="w-full">
          <div className="w-full flex flex-col gap-4">
            <label htmlFor="contract_address" className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
              Decent NFT to Spotlight
            </label>
            {!productData ? (
              <input
                type="text"
                id="contract_address"
                className="input"
                placeholder="Decent contract address (0x)"
                required
                onChange={onContractAddressChanged}
              />
            ) : (
              <p>
                {productData.metadata.name} | {productData.metadata.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </MultiStepFormWrapper>
  );
};

export default SetDecentProduct;
