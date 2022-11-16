import { FC, Fragment, useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner } from "wagmi";
import { utils } from "ethers";
import toast from 'react-hot-toast'
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { classNames } from "@/lib/utils/classNames";
import { getContractData, CONTRACT_TYPES_FOR_FEATURED } from "@/services/decent/getDecentNFT";

const SetDecentProduct = ({ setDecentProduct, productData = undefined }) => {
  const { chain } = useNetwork();
  const { data: signer } = useSigner();
  const [contractType, setContractType] = useState(CONTRACT_TYPES_FOR_FEATURED[0]);

  const onContractAddressChanged = (event) => {
    const val = event.target.value;
    if (utils.isAddress(val)) {
      _getContractData(val);
    }
  };

  const _getContractData = async (address) => {
    const data = await getContractData(address, chain.id, signer, contractType);

    if (data) {
      setDecentProduct({ address, contractType, ...data });
    } else {
      toast.error('Error finding contract!');
    }
  };

  return (
    <div className="w-full">
      <form className="w-full">
        <div className="w-full">
          <div className="w-full flex flex-col gap-4">
            <label htmlFor="contract_address" className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
              Featured Decent NFT
            </label>
            {
              !productData
                ? <>
                    <Listbox value={contractType} onChange={setContractType}>
                      {({ open }) => (
                        <>
                          <div className="relative mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
                            <Listbox.Button className="relative input py-2 pl-3 pr-10 text-left ">
                              <span className="block truncate">{contractType}</span>
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
                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md dark:bg-gray-800 bg-white py-1 text-base shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {CONTRACT_TYPES_FOR_FEATURED.map((contractType, index) => (
                                  <Listbox.Option
                                    key={`contract-type-${index}`}
                                    className={({ active }) =>
                                      classNames(
                                        active ? "bg-indigo-600 text-white" : "",
                                        "relative cursor-default select-none py-2 pl-3 pr-9"
                                      )
                                    }
                                    value={contractType}
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}>
                                          {contractType}
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
                    <input
                      type="text"
                      id="contract_address"
                      className="input"
                      placeholder="Contract address (0x)"
                      required
                      onChange={onContractAddressChanged}
                    />
                  </>
                : <p>{productData.metadata.name} | {productData.metadata.description}</p>
            }
          </div>
        </div>
      </form>
    </div>
  );
};

export default SetDecentProduct;
