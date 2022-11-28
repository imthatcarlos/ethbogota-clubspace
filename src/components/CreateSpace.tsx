import { FormEvent, Fragment, useState } from "react";
import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from "@/components/SetDecentProduct";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { useAccount, useContract, useSigner, useNetwork } from "wagmi";
import toast from "react-hot-toast";
import axios from "axios";
import { useJam } from "@/lib/jam-core-react";
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import { createGroup } from "@/lib/semaphore/semaphore";
import { LENSHUB_PROXY, makePostGasless, publicationBody } from "@/services/lens/gaslessTxs";
import { LensHubProxy } from "@/services/lens/abi";
import { launchSpace } from "@/services/jam/core";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { Dialog, Transition } from "@headlessui/react";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import useENS from "@/hooks/useENS";

type MultiFormData = {
  decentContractAddress: string;
  lensPost: string;
  goodyName: string;
  goodyDesc: string;
  goodyFiles: File[];
};

const INITIAL_DATA: MultiFormData = {
  decentContractAddress: "",
  lensPost: "",
  goodyName: "",
  goodyDesc: "",
  goodyFiles: [],
};

const CreateSpace = ({ isOpen, setIsOpen }) => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();

  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [goody, setGoody] = useState<any>();
  const [uploading, setUploading] = useState<boolean>();
  const [shareUrl, setShareUrl] = useState<string>();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const [state, jamApi] = useJam();
  const { data: lensRefreshData } = useLensRefresh();
  const { data: lensLoginData, refetch: login } = useLensLogin();
  const { ensName, isLoading: isLoadingENS } = useENS(address);
  const { data: profilesResponse } = useGetProfilesOwned({}, address);
  const defaultProfile = profilesResponse ? profilesResponse.defaultProfile : null;

  const [formMultiFormData, setMultiFormData] = useState(INITIAL_DATA);

  function closeShareModal() {
    setIsShareOpen(false);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const selectPlaylist = (playlist) => {
    setPlaylist(playlist);
  };

  // @TODO: we should render more info, some kind of preview + link out to decent
  const setDecentProduct = (data) => {
    setProductData(data);
  };

  const setPostData = (postData) => {
    setLensPost(postData);
  };

  const updateFields = (fields: Partial<MultiFormData>) => {
    setMultiFormData((prev) => {
      return { ...prev, ...fields };
    });
  };

  const { step, steps, currenStepIndex, back, next, goTo, isFirstStep, isLastStep } = useMultiStepForm([
    <SelectPlaylist key="a" selectPlaylist={selectPlaylist} playlist={playlist} />,
    <SetDecentProduct
      key="b"
      setDecentProduct={setDecentProduct}
      productData={productData}
      {...formMultiFormData}
      updateFields={updateFields}
    />,
    <CreateLensPost
      key="c"
      setPostData={setPostData}
      defaultProfile={defaultProfile}
      {...formMultiFormData}
      updateFields={updateFields}
    />,
    <SetGoodyBag key="d" setGoody={setGoody} {...formMultiFormData} updateFields={updateFields} />,
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLastStep) return next();

    submit();
  };

  const uploadToIPFS = async () => {
    // pick out files
    const music = goody.files.find((f) => f.path.endsWith(".wav") || f.path.endsWith(".mp3"));
    const cover = goody.files.find(
      (f) => f.path.endsWith(".png") || f.path.endsWith(".gif") || f.path.endsWith(".jpeg") || f.path.endsWith(".jpg")
    );

    // upload to ipfs
    console.log("uploading files");
    // const _music = await pinFileToIPFS(music);
    // const _image = await pinFileToIPFS(cover);
    const [musicResponse, coverResponse] = await Promise.all([
      fetch('/api/ipfs/post', { method: 'POST', body: music }),
      fetch('/api/ipfs/post', { method: 'POST', body: cover })
    ]);
    const _music = { IpfsHash: (await musicResponse.json()).ipfsHash };
    const _image = { IpfsHash: (await coverResponse.json()).ipfsHash };

    console.log("uploading metadata");
    // const metadata: any = await pinJson({
    //   name: goody.name,
    //   description: goody.description,
    //   image: `ipfs://${_image.IpfsHash}`,
    //   animation_url: `ipfs://${_music.IpfsHash}`,
    //   external_url: "https://joinclubspace.xyz",
    // });
    const metadataResponse = await fetch(
      '/api/ipfs/post',
      {
        method: 'POST',
        body: JSON.stringify({
          name: goody.name,
          description: goody.description,
          image: `ipfs://${_image.IpfsHash}`,
          animation_url: `ipfs://${_music.IpfsHash}`,
          external_url: "https://joinclubspace.xyz",
        })
      }
    );
    const metadata = { IpfsHash: (await metadataResponse.json()).ipfsHash };

    return `ipfs://${metadata.IpfsHash}`;
  };

  const contract = useContract({
    address: LENSHUB_PROXY,
    abi: LensHubProxy,
    signerOrProvider: signer,
  });

  const submit = async () => {
    setUploading(true);
    console.log(playlist, productData, lensPost, goody);

    // create space in the backend
    const { res, clubSpaceId, uuid } = await launchSpace(handle, jamApi);

    if (!res) {
      toast.error("Error - cannot make a space right now");
      return;
    }

    // upload content to ipfs
    toast("Setting goody bag...");
    const goodyUri = await uploadToIPFS();
    console.log("goody uri:", goodyUri);

    // create lens post (@TODO: make this part optional)
    // const content: any = await pinJson(publicationBody(lensPost, [], defaultProfile.handle));
    const response = await fetch(
      '/api/ipfs/post',
      {
        method: 'POST',
        body: JSON.stringify({
          json: publicationBody(lensPost, [], defaultProfile.handle)
        })
      },
    );
    const content = { IpfsHash: (await response.json()).ipfsHash };

    toast("Creating Lens post...", { duration: 10000 });
    const accessToken = lensLoginData?.authenticate?.accessToken
      ? lensLoginData?.authenticate?.accessToken
      : lensRefreshData.accessToken;
    if (!accessToken) {
      throw new Error("Error - lens profile not authenticated. This is likely a bug with login/refresh logic");
    }
    await makePostGasless(defaultProfile.id, `ipfs://${content.IpfsHash}`, signer, accessToken);
    const pubCount = await contract.getPubCount(defaultProfile.id);
    const lensPubId = pubCount.toHexString();

    const handle = defaultProfile?.handle || ensName || address;

    toast.promise(
      new Promise(async (resolve, reject) => {
        // call redis api
        const spaceData = {
          creatorAddress: address,
          creatorLensHandle: defaultProfile.handle,
          handle,
          creatorLensProfileId: defaultProfile.id,
          spinampPlaylistId: playlist.id,
          decentContractAddress: productData.address,
          decentContractChainId: chain.id,
          decentContractType: productData.contractType,
          lensPubId,
          clubSpaceId,
          uuid,
        };
        const {
          data: { url, semGroupIdHex },
        } = await axios.post(`/api/space/create`, spaceData);

        // call sempahore/create-group
        await createGroup(semGroupIdHex, goodyUri, lensPubId, defaultProfile.id);

        // PUSH
        await axios.post(`/api/push/send`, { url });

        setUploading(false);

        setShareUrl(url);
        setIsShareOpen(true);

        resolve();
      }),
      {
        loading: "Finalizing your space...",
        success: "Success!",
        error: (error) => {
          console.log(error);
          setUploading(false);
          return "Error!";
        },
      }
    );
  };

  if (shareUrl) {
    return (
      <Transition appear show={isShareOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeShareModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl min-h-[300px] transform overflow-hidden rounded-2xl bg-white dark:bg-black p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b-[1px] border-b-gray-600 pb-3"
                  >
                    Your space is live!
                  </Dialog.Title>
                  <div className="flex-1 flex items-center justify-center">
                    <p>
                      <a href={shareUrl} target="_blank" rel="noreferrer" className="dark:text-club-red">
                        {shareUrl}
                      </a>
                    </p>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  }

  return (
    <div className="w-full p-8 flex flex-col gap-3">
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl min-h-[300px] transform overflow-hidden rounded-2xl bg-white dark:bg-black p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b-[1px] border-b-gray-600 pb-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="dark:text-gray-300">Create a Space</span>
                      <span className="dark:text-gray-500 text-sm">
                        {currenStepIndex + 1} / {steps.length}
                      </span>
                    </div>
                  </Dialog.Title>

                  <form className="step-form" onSubmit={handleSubmit}>
                    {step}
                    <div className="mt-4 flex gap-x-2 justify-end absolute bottom-4 left-1/2 transform -translate-x-1/2 right-0">
                      <button
                        disabled={isFirstStep || uploading}
                        type="button"
                        className="btn disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={back}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        className="btn disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={(isLastStep && goody?.files?.length !== 2) || uploading}
                      >
                        {isLastStep ? `${uploading ? 'Creating...' : 'Create Space'}` : "Next"}
                      </button>
                    </div>
                    {isLastStep && goody?.files?.length > 0 && isLastStep && goody?.files?.length !== 2 ? (
                      <div className="text-red-400 text-center">
                        ⚠️ To continue, you need one audio file (.wav or .mp3) and one image.
                      </div>
                    ) : null}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CreateSpace;
