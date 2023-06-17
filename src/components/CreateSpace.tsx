import { FormEvent, Fragment, useState } from "react";
import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetFeaturedProduct from "@/components/SetFeaturedProduct";
import { IPlaylist, fetchPlaylistById, fetchTracksByIds } from "@spinamp/spinamp-sdk";
import { useAccount, useContractRead, useSigner, useNetwork, useSwitchNetwork } from "wagmi";
import toast from "react-hot-toast";
import axios from "axios";
import { BigNumber } from "ethers";
import { useJam } from "@/lib/jam-core-react";
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import { makePostGasless, publicationBody, ZERO_ADDRESS } from "@/services/lens/gaslessTxs";
import {
  LENSHUB_PROXY,
  ALLOWED_CHAIN_IDS,
  TIER_GATED_LENS_COLLECT,
  CLUBSPACE_SERVICE_FEE_PCT,
  CLUBSPACE_SERVICE_FEE_RECIPIENT,
} from "@/lib/consts";
import { LensHubProxy } from "@/services/lens/abi";
import { launchSpace } from "@/services/jam/core";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { Dialog, Transition } from "@headlessui/react";
import { useLensLogin, useLensRefresh } from "@/hooks/useLensLogin";
import { useGetProfilesOwned } from "@/services/lens/getProfile";
import useENS from "@/hooks/useENS";
import createZkEdition from "@/services/decent/createZkEdition";
import { wait } from "@/utils";
import { createGroup } from "@/lib/claim-without-semaphore/claims";
import Copy from "@/assets/svg/copy.svg";
import CreateLaunchTime from "./CreateLaunchTime";
import SelectTier from "./SelectTier";

type MultiFormData = {
  lensPost: string;
  pinnedLensPost: string;
  goodyName: string;
  launchDate: Date;
  goodyFiles: File[];
  collectCurrency: any;
  collectFee: string;
};

const INITIAL_DATA: MultiFormData = {
  lensPost: "",
  pinnedLensPost: "",
  goodyName: "",
  launchDate: null,
  goodyFiles: [],
  collectCurrency: { symbol: "", address: "" },
  collectFee: "1",
};

const CreateSpace = ({ isOpen, setIsOpen }) => {
  const { chain } = useNetwork();
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const { switchNetworkAsync } = useSwitchNetwork({ onSuccess: (data) => submit(true) });

  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [playlists, setMultiplePlaylists] = useState<IPlaylist[]>();
  const [drop, setDrop] = useState<any>();
  const [fullLensPost, setFullLensPost] = useState<any>();
  const [goodyContract, setGoodyContract] = useState<any>();
  const [launchDate, setLaunchDate] = useState<Date>();
  const [uploading, setUploading] = useState<boolean>();
  const [shareUrl, setShareUrl] = useState<string>();
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [spaceTier, setSpaceTier] = useState<string>("");
  const [files, setFiles] = useState<any[]>([]);

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
  };

  const selectDrop = (_drop) => {
    setDrop(_drop);
  };

  const setPostData = (postData) => {
    setFullLensPost(postData);
  };

  const updateFields = (fields: Partial<MultiFormData>) => {
    setMultiFormData((prev) => {
      return { ...prev, ...fields };
    });
  };

  const { step, steps, currenStepIndex, back, next, goTo, isFirstStep, isLastStep } = useMultiStepForm([
    <SelectTier key="a" setSpaceTier={setSpaceTier} spaceTier={spaceTier} />,
    <SelectPlaylist
      key="b"
      selectPlaylist={selectPlaylist}
      setMultiplePlaylists={setMultiplePlaylists}
      playlist={playlist}
    />,
    <SetFeaturedProduct
      key="c"
      selectDrop={selectDrop}
      drop={drop}
      {...formMultiFormData}
      updateFields={updateFields}
    />,
    <CreateLensPost
      key="d"
      setPostData={setPostData}
      defaultProfile={defaultProfile}
      {...formMultiFormData}
      updateFields={updateFields}
      spaceTier={spaceTier}
      fullLensPost={fullLensPost}
      files={files}
      setFiles={setFiles}
    />,
    <CreateLaunchTime key="e" setLaunchDate={setLaunchDate} {...formMultiFormData} updateFields={updateFields} />,
    <SetGoodyBag key="f" {...formMultiFormData} updateFields={updateFields} />,
  ]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLastStep) return next();

    submit();
  };

  const uploadToIPFS = async (handle, goodyName, goodyFiles) => {
    // pick out files
    const cover = goodyFiles.find(
      (f) => f.path.endsWith(".png") || f.path.endsWith(".gif") || f.path.endsWith(".jpeg") || f.path.endsWith(".jpg")
    );

    // upload to ipfs
    console.log("uploading files");
    // const coverResponse = await fetch('/api/ipfs/post', { method: 'POST', body: cover });
    // const _image = { IpfsHash: (await coverResponse.json()).ipfsHash };
    const _image = await pinFileToIPFS(cover);

    // get track list for description
    const { playlist: _playlist } = await fetchPlaylistById(playlist.id);
    const tracks = await fetchTracksByIds(_playlist.trackIds);
    const tracklist = tracks.map((t, i) => `${i}. ${t.artist.name} - ${t.title}`).join("\n");
    const description = `ClubSpace hosted by @${handle}\n\n${tracklist}`;

    console.log("uploading metadata");
    const metadataResponse = await fetch("/api/ipfs/post", {
      method: "POST",
      body: JSON.stringify({
        name: goodyName,
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

    try {
      const { goodyName, goodyFiles, collectCurrency, collectFee, pinnedLensPost } = formMultiFormData;

      // if no goody contract set, we're deploying one and need to be on the right network
      if (((goodyName && goodyFiles?.length) || fullLensPost) && !switched && chain.id !== ALLOWED_CHAIN_IDS[0]) {
        toast("Switching chains...");
        try {
          await switchNetworkAsync(ALLOWED_CHAIN_IDS[0]);
        } catch (error) {
          setUploading(false);
        }
        return;
      } else if (switched) {
        await wait(2000);
      }

      const handle = defaultProfile?.handle || ensData?.handle || address;

      // if (!((playlist || playlists?.length) && (drop || pinnedLensPost))) {
      if (!(drop || pinnedLensPost)) {
        toast.error("Error - missing something in the form. Go back and check your inputs");
        setUploading(false);
        return;
      }

      // @TODO: delay this request so the audio doesn't start playing automatically?
      // create space in the backend
      const { res, clubSpaceId, uuid } = await launchSpace(handle, jamApi);

      if (!res) {
        toast.error("Error - cannot make a space right now");
        setUploading(false);
        return;
      }

      let toastId;
      let collectionAddress;
      if (!(goodyName && goodyFiles?.length)) {
        collectionAddress = ZERO_ADDRESS;
      } else {
        toastId = toast.loading("Creating your Party Favor...");
        const goodyUri = await uploadToIPFS(handle, goodyName, goodyFiles);
        console.log("goody uri:", goodyUri);
        collectionAddress = await createZkEdition({
          handle,
          chainId: chain.id,
          signer,
          name: goodyName,
          uri: goodyUri,
        });
        console.log("collectionAddress:", collectionAddress);
        toast.dismiss(toastId);

        if (!collectionAddress) {
          toast.error("Error - could not create Party Favor");
          setUploading(false);
          return;
        }
      }

      // create lens post
      let lensPubId = "0";
      if (fullLensPost) {
        let attachments: any[] = [];
        if (files.length > 0) {
          const cids = await Promise.all(
            files.map(async (file: any) => ({
              item: `ipfs://${(await pinFileToIPFS(file)).IpfsHash}`,
              type: file.type,
              altTag: "",
            }))
          );
          attachments = attachments.concat(cids);
        }
        console.log(JSON.stringify(publicationBody(fullLensPost, attachments, defaultProfile.handle), null, 2));
        const response = await fetch("/api/ipfs/post", {
          method: "POST",
          body: JSON.stringify({
            json: publicationBody(fullLensPost, attachments, defaultProfile.handle),
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

        const multirecipientFeeCollectModule =
          spaceTier === TIER_GATED_LENS_COLLECT
            ? {
                amount: { currency: collectCurrency.address, value: collectFee },
                recipients: [
                  { recipient: address, split: 100 - CLUBSPACE_SERVICE_FEE_PCT },
                  { recipient: CLUBSPACE_SERVICE_FEE_RECIPIENT, split: CLUBSPACE_SERVICE_FEE_PCT },
                ],
                followerOnly: false,
                referralFee: 0,
                // endTimestamp:
              }
            : undefined;

        console.log(`multirecipientFeeCollectModule: `, multirecipientFeeCollectModule);

        await makePostGasless(
          defaultProfile.id,
          `ipfs://${content.IpfsHash}`,
          signer,
          accessToken,
          multirecipientFeeCollectModule
        );

        toast.dismiss(toastId);
      }

      toast.promise(
        new Promise(async (resolve, reject) => {
          // call redis api
          const gated =
            spaceTier === TIER_GATED_LENS_COLLECT ? { tier: spaceTier, collectCurrency, collectFee } : undefined;
          const spaceData = {
            creatorAddress: address,
            creatorLensHandle: defaultProfile.handle,
            handle,
            creatorLensProfileId: defaultProfile.id,
            emptyPlaylist: !(playlist?.id || playlists?.length),
            spinampPlaylistId: playlist?.id,
            b2bSpinampPlaylistIds: playlists?.map(({ id }) => id),
            drop,
            lensPubId,
            clubSpaceId,
            uuid,
            partyFavorContractAddress: collectionAddress,
            startAt: launchDate,
            pinnedLensPost,
            gated,
          };
          const {
            data: { url, semGroupIdHex },
          } = await axios.post(`/api/space/create`, spaceData);

          // call sempahore/create-group
          if (collectionAddress !== ZERO_ADDRESS) {
            toastId = toast.loading("Registering your Party Favor...");
            await createGroup(semGroupIdHex, collectionAddress, lensPubId, defaultProfile.id, signer);
            toast.dismiss(toastId);
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
    } catch (error) {
      console.log(error);
      setUploading(false);
      toast.error("An error has ocurred");
    }
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
                <Dialog.Panel className="flex min-h-[300px] w-full max-w-xl transform flex-col overflow-hidden rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="border-b-[1px] border-b-gray-600 pb-3 text-lg font-medium leading-6 text-gray-100"
                  >
                    Your space is {launchDate ? "scheduled" : "live"}!
                  </Dialog.Title>
                  <div className=" items-center justify-center">
                    <p className="mt-3 flex">
                      <a href={shareUrl} target="_blank" rel="noreferrer" className="mr-2 underline">
                        {shareUrl}
                      </a>
                      <Copy onClick={() => navigator.clipboard.writeText(shareUrl)} className="copy-btn w-7 p-1 " />
                    </p>
                    <p className="mt-4">Tips & Tricks for a great time:</p>
                    <ol className="ml-6 list-decimal">
                      <li>ClubSpace works best on Chrome browser on desktop</li>
                      <li>If you're planning to hop on the mic use headphones for the best experience</li>
                      <li>Have fun and stay hydrated!</li>
                    </ol>
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
    <div className="flex w-full flex-col gap-3 p-8">
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
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-all duration-100" />
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
                <Dialog.Panel className="min-h-[300px] w-full max-w-xl transform overflow-visible rounded-2xl bg-black p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="border-b-[1px] border-b-gray-600 pb-3 text-lg font-medium leading-6 text-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Create a Space</span>
                      <span className="text-sm text-gray-500">
                        {currenStepIndex + 1} / {steps.length}
                      </span>
                    </div>
                  </Dialog.Title>

                  <form className="step-form" onSubmit={handleSubmit}>
                    {step}
                    <div className="absolute bottom-4 left-1/2 right-0 mt-4 flex -translate-x-1/2 transform justify-end gap-x-2">
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
