import { FC, Fragment } from "react";
import { useSigner, useAccount, useNetwork } from "wagmi";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { classNames } from "@/lib/utils/classNames";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import useGetDeployedProducts from "@/hooks/useGetDeployedProducts"
import { CONTRACT_TYPES_FOR_FEATURED } from "@/services/decent/utils";
import { kFormatter } from '@/utils';

const SetFeaturedProduct = ({ setDecentProduct, decentProduct = undefined, updateFields }) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const { data: deployedProducts, isLoading } = useGetDeployedProducts(address, chain.id, signer);

  const getProductName = ({ chain, metadata, contractType, availableSupply, totalSupply, soldOut, saleIsActive }) => {
    const namePart = `[${chain}] ${metadata?.name}`;
    const salePart = saleIsActive
      ? `${soldOut ? 'SOLD OUT' : `${totalSupply} / ${kFormatter(availableSupply)} minted`}`
      : 'SALE IS NOT ACTIVE';

    return `${namePart} - ${salePart}`;
  };

  // only allowing editions + crescendo contracts deployed on certain chains
  const getIsProductEnabled = ({ chainId, contractType, soldOut, saleIsActive }) => (
    // saleIsActive && CONTRACT_TYPES_FOR_FEATURED.includes(contractType) && !soldOut
    CONTRACT_TYPES_FOR_FEATURED.includes(contractType) && !soldOut
  );

  return (
    <MultiStepFormWrapper>
      <div className="w-full">
        <div className="w-full">
          <div className="w-full flex flex-col gap-4">
            <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Featured Decent NFT</h2>
            {
              isLoading && (
                <p>Loading Your Collections...</p>
              )
            }
            {
              !isLoading && (
                <>
                  {deployedProducts && (
                    <>
                      <Listbox value={decentProduct} onChange={setDecentProduct}>
                        {({ open }) => (
                          <>
                            <div className="relative mt-1 bg-gray-800 border border-gray-600 rounded-md">
                              <Listbox.Button className="relative input py-2 pl-3 pr-10 text-left ">
                                <span className="block truncate">{decentProduct ? getProductName(decentProduct) : "Select from your collections"}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                              </Listbox.Button>

                              <Transition
                                show={open}
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {deployedProducts.map((contract, index) => (
                                    <Listbox.Option
                                      key={index}
                                      className={({ active }) =>
                                        classNames(
                                          active ? "bg-indigo-600 text-white" : "",
                                          "relative cursor-default select-none py-2 pl-3 pr-9"
                                        )
                                      }
                                      value={contract}
                                      disabled={!getIsProductEnabled(contract)}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span
                                            className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}
                                          >
                                            {getProductName(contract)}
                                          </span>

                                          {selected ? (
                                            <span
                                              className={classNames(
                                                active ? "text-white" : "text-indigo-600",
                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                              )}
                                            >
                                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </>
                        )}
                      </Listbox>
                      <br/>
                    </>
                  )}
                </>
              )
            }
          </div>
        </div>
      </div>
    </MultiStepFormWrapper>
  );
};

export default SetFeaturedProduct;
