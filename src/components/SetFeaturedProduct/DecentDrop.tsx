import { FC, Fragment, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { classNames } from "@/lib/utils/classNames";
import { Listbox, Transition } from "@headlessui/react";
import { CONTRACT_TYPES_FOR_FEATURED } from "@/services/decent/utils";
import { kFormatter } from '@/utils';
import { getUrlForImageFromIpfs } from "@/utils";

export default ({ deployedProducts, selectDrop, protocol }) => {
  const [decentProduct, setDecentProduct] = useState();

  const getProductName = ({ chain, metadata, contractType, availableSupply, totalSupply, soldOut, saleIsActive }) => {
    const namePart = `[${chain}] ${metadata?.name}`;
    const salePart = saleIsActive
      ? `${soldOut ? 'SOLD OUT' : `${totalSupply} / ${kFormatter(availableSupply)} minted`}`
      : 'SALE IS NOT ACTIVE';

    return `${namePart} - ${salePart}`;
  };

  // only allowing editions + crescendo contracts deployed on certain chains
  const getIsProductEnabled = ({ chainId, contractType }) => (
    CONTRACT_TYPES_FOR_FEATURED.includes(contractType)
  );

  const _setDecentProduct = (data) => {
    setDecentProduct(data);
    selectDrop({
      decentContractAddress: drop.decentContractAddress,
      decentContractType: drop.decentContractType,
      decentContractChainId: drop.decentContractChainId,
      productBannerUrl: getUrlForImageFromIpfs(drop.metadata.image),
      protocol,
    });
  };

  return (
    <>
      {deployedProducts && (
        <>
          <Listbox value={decentProduct} onChange={_setDecentProduct}>
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
};
