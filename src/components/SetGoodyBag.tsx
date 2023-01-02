import { Fragment, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useAccount, useSigner, useNetwork } from "wagmi";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import { classNames } from "@/lib/utils/classNames";
import useGetDeployedZkEditions from "@/hooks/useGetDeployedZkEditions";
import { DEFAULT_PARTY_FAVOR } from "@/services/decent/utils";

const allowableImageTypes = [".png", ".gif", ".jpeg", ".jpg"];

const SetGoodyBag = ({ setGoody, goodyName, goodyDesc, updateFields, goodyFiles, goodyContract, setGoodyContract }) => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { data: deployedZkEditions, isLoading } = useGetDeployedZkEditions(address, chain.id, signer);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const _files = acceptedFiles.map((file: any) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      updateFields({ goodyFiles, _files });
      onChange({ name: goodyName, description: goodyDesc, files: _files });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goodyDesc, goodyFiles, goodyName, updateFields]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles } = useDropzone({
    onDrop,
    // accept: { "audio/*": [".wav", ".mp3"], "image/*": allowableImageTypes },
    accept: { "image/*": allowableImageTypes },
    maxFiles: 1,
    maxSize: 50000000,
  });

  // TODO: styles
  const style = useMemo(() => {
    return isDragAccept
      ? "p-8 border-dotted border-2 border-green-600"
      : isDragReject
      ? "p-8 border-dotted border-2 border-red-600"
      : isDragActive
      ? "p-8 border-dotted border-2 border-indigo-600"
      : "p-8 border-dotted border-2";
  }, [isDragActive, isDragReject, isDragAccept]);

  const onChange = ({ name, files }) => {
    updateFields({ goodyName: name, goodyFiles: files });
    setGoody({ name, files });
  };

  const thumbs = goodyFiles
    .filter(({ path }) => allowableImageTypes.some((type) => path.includes(type)))
    .map((file) => (
      <div className="inline-flex p-2" key={file.name}>
        <div className="flex min-w-0 overflow-hidden">
          <img
            alt=""
            src={file.preview}
            className="block w-auto h-full"
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
          />
        </div>
      </div>
    ));

  const getGoodyBagName = ({ address, metadata }) => (
    address.toLowerCase() === DEFAULT_PARTY_FAVOR.toLowerCase() ? `[DEFAULT] ${metadata.name}` : metadata.name
  )

  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-3">
        <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Select your Party Favor NFT or Create One</h2>
        <p>Party Favors are a free gift that anyone who attends your space for at least 3 minutes can claim</p>
        {
          isLoading && (
            <p>Loading Party Favors...</p>
          )
        }
        {
          !isLoading && (
            <>
              {/* {deployedZkEditions && (
                <>
                  <Listbox value={goodyContract} onChange={setGoodyContract}>
                    {({ open }) => (
                      <>
                        <div className="relative mt-1 bg-gray-800 border border-gray-600 rounded-md">
                          <Listbox.Button className="relative input py-2 pl-3 pr-10 text-left ">
                            <span className="block truncate">{goodyContract ? getGoodyBagName(goodyContract) : "Select deployed contract"}</span>
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
                              {deployedZkEditions.map((contract, index) => (
                                <Listbox.Option
                                  key={index}
                                  className={({ active }) =>
                                    classNames(
                                      active ? "bg-indigo-600 text-white" : "",
                                      "relative cursor-default select-none py-2 pl-3 pr-9"
                                    )
                                  }
                                  value={contract}
                                >
                                  {({ selected, active }) => (
                                    <>
                                      <span
                                        className={classNames(selected ? "font-semibold" : "font-normal", "block truncate")}
                                      >
                                        {getGoodyBagName(contract)}
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
              )} */}
              {/* <p>Or create a new Party Favor NFT:</p> */}
              <i className="text-sm">The track list for the space will be included in the NFT metadata automatically</i>
              <div className="w-full flex flex-col gap-3">
                <input
                  type="text"
                  className="input"
                  placeholder="Give your NFT a title"
                  value={goodyName}
                  onChange={(e) => onChange({ name: e.target.value, files: goodyFiles })}
                  required={!goodyContract}
                />
                <div {...getRootProps()} className={style}>
                  <input {...getInputProps()} />
                  {acceptedFiles.length === 0 ? (
                    <>
                      <p>Drop the image for your NFT</p>
                      <p>(max: 50mb)</p>
                    </>
                  ) : (
                    acceptedFiles.map((f) => <p key={(f as any).path}>{(f as any).path}</p>)
                  )}
                </div>
                <aside className="flex flex-wrap mt-1">{thumbs}</aside>
              </div>
            </>
          )
        }
      </div>
    </MultiStepFormWrapper>
  );
};

export default SetGoodyBag;
