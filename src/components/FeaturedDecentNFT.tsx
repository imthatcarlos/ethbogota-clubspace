import React, { useState } from "react";
import { Contract, BigNumber, utils } from "ethers";
import toast from "react-hot-toast";
import { getUrlForImageFromIpfs } from "@/utils/ipfs";
import { CONTRACT_TYPE_CRESCENDO, CONTRACT_TYPE_EDITION } from "@/services/decent/getDecentNFT";

interface Props {
  contract: Contract;
  contractType: string; // crescendo | edition
  address: string;
  metadata: any; // metadata JSON
  price: BigNumber;
  totalSupply: BigNumber;
  availableSupply?: BigNumber;
  saleIsActive: boolean;
  decentURL: string;
}

export const FeaturedDecentNFT = ({
  contract,
  contractType,
  address,
  metadata,
  price,
  totalSupply,
  availableSupply = undefined,
  saleIsActive,
  decentURL,
}: Props) => {
  const [isBuying, setIsBuying] = useState<boolean>(false);

  const onBuyClick = async () => {
    setIsBuying(true);

    console.log(contractType);
    console.log(contract);

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const tx =
            (await contractType) == CONTRACT_TYPE_CRESCENDO
              ? await contract.buy(0, { value: price })
              : await contract.mint(1, { value: price });

          console.log(`tx: ${tx.hash}`);
          await tx.wait();

          setIsBuying(false);

          resolve();
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: "Minting...",
        success: "Success!",
        error: (error) => {
          console.log(error);
          setIsBuying(false);
          return "Error!";
        },
      }
    );
  };

  return (
    <>
      <div>
        <h2 className="my-4 text-4xl font-bold tracking-tight sm:text-2xl md:text-5xl drop-shadow-sm text-center">
          Featured Drop
        </h2>
        <div className="flex w-full justify-center relative">
          <div className="max-w-[20rem] min-w-[17rem]">
            <div className="bg-slate-800 shadow-xl rounded-lg">
              <div className="photo-wrapper p-2 pt-0 overflow-hidden">
                <img
                  className="absolute t-0 left-0 right-0 w-full h-full object-cover opacity-50 rounded-md"
                  src={getUrlForImageFromIpfs(metadata.image)}
                  alt=""
                />
              </div>
              <div className="p-2 pt-10 relative">
                <h3 className="text-center text-xl text-gray-900 dark:text-gray-300 font-medium leading-8 -mb-2">
                  {metadata.name}
                </h3>
                <div className="text-center text-gray-400 text-md font-semibold mb-1">
                  <p>
                    <a target="_blank" rel="noreferrer" href={decentURL}>
                      See on Decent.xyz
                    </a>
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-white mb-0 p-4 text-center">{metadata.description}</p>

                <div className="flex justify-center mb-8 text-sm gap-x-4">
                  <div className="flex gap-x-2">
                    <span>
                      <strong>
                        {totalSupply.toNumber()}
                        {availableSupply ? ` / ${utils.formatEther(availableSupply)}` : ""}
                      </strong>
                    </span>
                    <span className="dark:text-gray-400">{!availableSupply ? "Minted" : "Supply"}</span>
                  </div>

                  <div className="flex gap-x-2">
                    <span>
                      <strong>{utils.formatEther(price)}</strong>
                    </span>
                    <span className="dark:text-gray-400">ether</span>
                  </div>
                </div>

                {saleIsActive ? (
                  <div className="text-center my-3 px-3">
                    <button className="!w-full btn" onClick={onBuyClick} disabled={isBuying}>
                      Mint
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
