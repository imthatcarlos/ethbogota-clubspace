import { FormEvent, Fragment, useState } from "react";
import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetFeaturedProduct from "@/components/SetFeaturedProduct";
import { IPlaylist, fetchPlaylistById } from "@spinamp/spinamp-sdk";
import { useAccount, useContractRead, useSigner, useNetwork, useSwitchNetwork } from "wagmi";
import toast from "react-hot-toast";
import axios from "axios";
import { BigNumber } from "ethers";
import { useJam } from "@/lib/jam-core-react";
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import { makePostGasless, publicationBody, ZERO_ADDRESS } from "@/services/lens/gaslessTxs";
import { LENSHUB_PROXY, ALLOWED_CHAIN_IDS } from "@/lib/consts";
import { LensHubProxy } from "@/services/lens/abi";
import { launchSpace } from "@/services/jam/core";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { Dialog, Transition } from "@headlessui/react";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import useENS from "@/hooks/useENS";
import createZkEdition from "@/services/decent/createZkEdition";
import { wait, getUrlForImageFromIpfs } from "@/utils";
import { createGroup } from "@/lib/claim-without-semaphore/claims";
import Copy from "@/assets/svg/copy.svg";

type MultiFormData = {
  lensPost: string;
  goodyName: string;
  goodyDesc: string;
  goodyFiles: File[];
};

const INITIAL_DATA: MultiFormData = {
  lensPost: "",
  goodyName: "",
  goodyDesc: "",
  goodyFiles: [],
};

const CreateSpace = ({ isOpen, setIsOpen }) => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { switchNetworkAsync } = useSwitchNetwork({ onSuccess: (data) => submit(true) });

  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [decentProduct, setDecentProduct] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [goody, setGoody] = useState<any>();
  const [goodyContract, setGoodyContract] = useState<any>();
  const [uploading, setUploading] = useState<boolean>();
  const [shareUrl, setShareUrl] = useState<string>();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const [state, jamApi] = useJam();
  const { data: lensRefreshData } = useLensRefresh();
  const { data: lensLoginData, refetch: login } = useLensLogin();
  const { data: ensData, isLoading: isLoadingENS } = useENS(address);
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
    next();
  };

  const selectDecentProduct = (product) => {
    setDecentProduct(product);
    next();
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
    <SetFeaturedProduct
      key="b"
      setDecentProduct={selectDecentProduct}
      decentProduct={decentProduct}
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
    <SetGoodyBag
      key="d"
      setGoody={setGoody}
      {...formMultiFormData}
      updateFields={updateFields}
      goodyContract={goodyContract}
      setGoodyContract={setGoodyContract}
    />,
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLastStep) return next();

    submit();
  };

  const uploadToIPFS = async (handle) => {
    // pick out files
    const cover = goody.files.find(
      (f) => f.path.endsWith(".png") || f.path.endsWith(".gif") || f.path.endsWith(".jpeg") || f.path.endsWith(".jpg")
    );

    // upload to ipfs
    console.log("uploading files");
    // const coverResponse = await fetch('/api/ipfs/post', { method: 'POST', body: cover });
    // const _image = { IpfsHash: (await coverResponse.json()).ipfsHash };
    const _image = await pinFileToIPFS(cover);

    // get track list for description
    const playlistData = await fetchPlaylistById(playlist.id);
    const tracklist = playlistData.playlistTracks.map((t, i) => `${i}. ${t.artist.name} - ${t.title}`).join("\n");
    const description = `ClubSpace hosted by ${handle}\n\n${tracklist}`;

    console.log("uploading metadata");
    const metadataResponse = await fetch("/api/ipfs/post", {
      method: "POST",
      body: JSON.stringify({
        name: goody.name,
        description,
        image: `ipfs://${_image.IpfsHash}`,
        // animation_url: `ipfs://${_music.IpfsHash}`,
        external_url: "https://joinclubspace.xyz",
      }),
    });
    const metadata = { IpfsHash: (await metadataResponse.json()).ipfsHash };

    return `ipfs://${metadata.IpfsHash}`;
  };

  const { data: lensPubCount } = useContractRead({
    address: LENSHUB_PROXY,
    abi: LensHubProxy,
    chainId: ALLOWED_CHAIN_IDS[0],
    functionName: "getPubCount",
    args: [defaultProfile?.id],
  });

  const submit = async (switched = false) => {
    setUploading(true);

    // if no goody contract set, we're deploying one and need to be on the right network
    if (goody && !switched && chain.id !== ALLOWED_CHAIN_IDS[0]) {
      toast("Switching chains...");
      try {
        await switchNetworkAsync(ALLOWED_CHAIN_IDS[0]);
      } catch (error) {
        setUploading(false);
      }
      return;
    } else if (switched) {
      await wait(1000);
    }

    const handle = defaultProfile?.handle || ensData?.handle || address;

    console.log(handle, playlist, decentProduct, lensPost, goody, goodyContract);

    // @TODO: delay this request so the audio doesn't start playing automatically?
    // create space in the backend
    const { res, clubSpaceId, uuid } = await launchSpace(handle, jamApi);

    if (!res) {
      toast.error("Error - cannot make a space right now");
      return;
    }

    let toastId;
    let collectionAddress;
    if (!goody) {
      collectionAddress = ZERO_ADDRESS;
    } else {
      toastId = toast.loading("Creating your Party Favor...");
      const goodyUri = await uploadToIPFS(handle);
      console.log("goody uri:", goodyUri);
      collectionAddress = await createZkEdition({
        handle,
        chainId: chain.id,
        signer,
        name: goody.name,
        uri: goodyUri,
      });
      console.log("collectionAddress:", collectionAddress);
      toast.dismiss(toastId);

      if (!collectionAddress) {
        toast.error('Error - could not create Party Favor');
        return;
      }
    }

    // create lens post
    let lensPubId = "0";
    if (lensPost) {
      const response = await fetch("/api/ipfs/post", {
        method: "POST",
        body: JSON.stringify({
          json: publicationBody(lensPost, [], defaultProfile.handle),
        }),
      });
      const content = { IpfsHash: (await response.json()).ipfsHash };

      toastId = toast.loading("Creating Lens post...", { duration: 10000 });
      const accessToken = lensLoginData?.authenticate?.accessToken
        ? lensLoginData?.authenticate?.accessToken
        : lensRefreshData.accessToken;
      if (!accessToken) {
        throw new Error("Error - lens profile not authenticated. This is likely a bug with login/refresh logic");
      }
      lensPubId = lensPubCount.add(BigNumber.from("1")).toHexString();

      await makePostGasless(defaultProfile.id, `ipfs://${content.IpfsHash}`, signer, accessToken);

      toast.dismiss(toastId);
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        // call redis api
        const spaceData = {
          creatorAddress: address,
          creatorLensHandle: defaultProfile.handle,
          handle,
          creatorLensProfileId: defaultProfile.id,
          spinampPlaylistId: playlist.id,
          decentContractAddress: decentProduct.address,
          decentContractChainId: decentProduct.chainId,
          decentContractType: decentProduct.contractType,
          productBannerUrl: getUrlForImageFromIpfs(decentProduct.metadata.image),
          lensPubId,
          clubSpaceId,
          uuid,
          partyFavorContractAddress: collectionAddress,
          // startAt: Math.floor(1673647200000 / 1000) // @TODO: datetime picker
        };
        const {
          data: { url, semGroupIdHex },
        } = await axios.post(`/api/space/create`, spaceData);

        // call sempahore/create-group
        if (collectionAddress !== ZERO_ADDRESS) {
          await createGroup(semGroupIdHex, collectionAddress, lensPubId, defaultProfile.id, signer);
        }
        // PUSH
        // await axios.post(`/api/push/send`, { url });

        // HACK: give the radio worker time to finish
        // @TODO: some status api
        if (collectionAddress === ZERO_ADDRESS) {
          await wait(3000);
        }

        setUploading(false);
        setShareUrl(url);
        setIsShareOpen(true);
        resolve();
      }),
      {
        loading: "Creating your space...",
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
                <Dialog.Panel className="w-full max-w-xl min-h-[300px] transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-100 border-b-[1px] border-b-gray-600 pb-3"
                  >
                    Your space is live!
                  </Dialog.Title>
                  <div className=" items-center justify-center">
                    <p className="flex mt-3">
                      <a href={shareUrl} target="_blank" rel="noreferrer" className="underline mr-2">
                        {shareUrl}
                      </a>
                      <Copy  onClick={() => navigator.clipboard.writeText(shareUrl)} className="copy-btn w-7 p-1 " />
                    </p>
                    <p className="mt-4">Tips & Tricks for a great time:</p>
                    <p>1. ClubSpace works best on Chrome browser on your desktop or laptop</p>
                    <p>2. If you're planning to hop on the mic use headphones for the best experience</p>
                    <p>3. Have fun and stay hydrated!</p>
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
                <Dialog.Panel className="w-full max-w-xl min-h-[300px] transform overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-100 border-b-[1px] border-b-gray-600 pb-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Create a Space</span>
                      <span className="text-gray-500 text-sm">
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
                        disabled={uploading}
                      >
                        {isLastStep ? `${uploading ? "Creating..." : "Create Space"}` : "Next"}
                      </button>
                    </div>
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
