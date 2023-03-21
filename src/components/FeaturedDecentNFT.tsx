import React, { useState, useMemo } from "react";
import { Contract, BigNumber, utils } from "ethers";
import { useNetwork, useSigner, useSwitchNetwork, useAccount } from "wagmi";
import toast from "react-hot-toast";
import { unescape } from "lodash/string";
import { fieldNamePrivy, getUrlForImageFromIpfs, wait } from "@/utils";
import { CONTRACT_TYPE_CRESCENDO, CONTRACT_TYPE_EDITION } from "@/services/decent/utils";
import { CURRENCY_MAP, CHAIN_NAME_MAP } from "@/lib/consts";
import { logAction } from "@madfi/ts-sdk";

const MAX_DESCRIPTION_LENGTH = 250;

interface Props {
  contract: Contract;
  contractType: string;
  address: string;
  metadata: any; // metadata JSON
  price: BigNumber;
  totalSupply: BigNumber;
  availableSupply?: BigNumber;
  saleIsActive: boolean;
  decentURL: string;
  chainId: number; // chain the decent contract is deployed on
  semGroupIdHex: string;
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
  chainId,
  semGroupIdHex,
}: Props) => {
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { connector: activeConnector, address: userAddress } = useAccount();
  const { switchNetworkAsync } = useSwitchNetwork({ onSuccess: (data) => onBuyClick(true) });

  const onBuyClick = async (switched = false) => {
    setIsBuying(true);

    if (!switched && chainId !== chain.id) {
      toast("Switching chains...");
      try {
        await switchNetworkAsync(chainId);
      } catch (error) {
        setIsBuying(false);
      }
      return;
    } else if (switched) {
      await wait(1000);
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          logAction(userAddress, fieldNamePrivy(semGroupIdHex), { action: "buy_drop", address: contract.address });

          const _signer = await activeConnector.getSigner();
          const tx =
            contractType == CONTRACT_TYPE_CRESCENDO
              ? await contract.connect(_signer).buy(0, { value: price, gasLimit: 150_000 })
              : await contract.connect(_signer).mint(userAddress, 1, { value: price, gasLimit: 150_000 });

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

          try {
            const realError = typeof error === "object" ? error.toString().split("(")[0] : "";

            if (realError.startsWith("Error: user rejected")) {
              return realError;
            } else if (error.data?.message.startsWith("err: insufficient")) {
              return "Insufficient funds";
            }
          } catch {}

          return "Error!";
        },
      }
    );
  };

  const parsedDescription = useMemo(() => {
    const replacements = { "\\\\": "\\", "\\n": "\n", '\\"': '"' };
    let d = unescape(metadata.description.substring(0, MAX_DESCRIPTION_LENGTH));
    d = d.replace(/\\(\\|n|")/g, (replace) => replacements[replace]);
    return metadata.description.length > MAX_DESCRIPTION_LENGTH ? `${d}...` : d;
  }, [metadata.description]);

  return (
    <>
      <div>
        <h2 className="my-4 text-4xl font-bold tracking-tight sm:text-2xl md:text-5xl drop-shadow-sm text-center">
          Featured Drop
        </h2>
        <div className="flex w-full justify-center relative">
          <div className="max-w-[20rem] min-w-[17rem]">
            <div className="bg-slate-800 shadow-xl rounded-lg relative">
              <div className="photo-wrapper p-2 pt-0 overflow-hidden">
                {!metadata.isVideo ? (
                  <img
                    className="absolute t-0 left-0 right-0 w-full h-full object-cover opacity-50 rounded-md"
                    src={getUrlForImageFromIpfs(metadata.image)}
                    alt=""
                  />
                ) : (
                  <video
                    className="absolute t-0 left-0 right-0 w-full h-full object-cover opacity-50 rounded-md"
                    src={getUrlForImageFromIpfs(metadata.animation_url || metadata.image)}
                    autoPlay
                    muted
                    loop
                  />
                )}
              </div>
              <div className="p-2 pt-10 relative">
                <h3 className="text-center text-xl text-gray-300 font-medium leading-8 -mb-2">{metadata.name}</h3>

                <p className="text-sm text-gray-300 dark:text-white mb-0 p-4 text-center">{parsedDescription}</p>

                <div className="text-center text-gray-400 text-sm font-semibold mb-4 -mt-2">
                  <p>
                    <a target="_blank" rel="noreferrer" href={decentURL}>
                      See on Decent.xyz
                    </a>
                  </p>
                </div>

                <div className="flex justify-center mb-8 text-sm gap-x-4">
                  <div className="flex gap-x-2">
                    <span>
                      <strong>
                        {totalSupply.toNumber()}
                        {availableSupply ? ` / ${availableSupply}` : ""}
                      </strong>
                    </span>
                    <span className="text-gray-400">Minted</span>
                  </div>

                  <div className="flex gap-x-2">
                    <span>
                      <strong>{utils.formatEther(price)}</strong>
                    </span>
                    <span className="text-gray-400">{CURRENCY_MAP[chainId]}</span>
                  </div>
                </div>

                {saleIsActive ? (
                  <div className="text-center my-3 px-3">
                    {chain && (
                      <button className="!w-full btn" onClick={() => onBuyClick()} disabled={isBuying}>
                        {price.isZero() ? "Free Mint" : "Mint"}{" "}
                        {chainId != chain.id ? `(on ${CHAIN_NAME_MAP[chainId]})` : ""}
                      </button>
                    )}
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
