import { useState } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";
import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from "@/components/SetDecentProduct";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { useAccount, useContract, useSigner } from "wagmi";
import toast from "react-hot-toast";
import axios from "axios";
import { useJam } from "@/lib/jam-core-react";
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import { createGroup } from "@/lib/semaphore/semaphore";
import { LENSHUB_PROXY, makePostGasless, publicationBody } from "@/services/lens/gaslessTxs";
import { LensHubProxy } from "@/services/lens/abi";
import useLensLogin from "@/hooks/useLensLogin";
import { launchSpace } from "@/services/jam/core";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";

const CreateSpace = ({ defaultProfile, ensName }) => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [goody, setGoody] = useState<any>();
  const [uploading, setUploading] = useState<boolean>();
  const [shareUrl, setShareUrl] = useState<string>();
  const [state, jamApi] = useJam();

  const { data: lensLogin, refetch: login } = useLensLogin();

  const selectPlaylist = (playlist) => {
    setPlaylist(playlist);
  };

  // @TODO: we should render more info, some kind of preview + link out to decent
  const setDecentProduct = (data) => {
    console.log(data);
    setProductData(data.metadata);
  };

  const setPostData = (postData) => {
    setLensPost(postData);
  };

  const { step, steps, currenStepIndex, back, next, goTo, isFirstStep, isLastStep } = useMultiStepForm([
    <SelectPlaylist key="a" selectPlaylist={selectPlaylist} playlist={playlist} />,
    <SetDecentProduct key="b" setDecentProduct={setDecentProduct} productData={productData} />,
    <CreateLensPost key="c" setPostData={setPostData} defaultProfile={defaultProfile} />,
    <SetGoodyBag key="d" setGoody={setGoody} />,
  ]);

  const uploadToIPFS = async () => {
    // pick out files
    const music = goody.files.find((f) => f.path.endsWith(".wav") || f.path.endsWith(".mp3"));
    const cover = goody.files.find(
      (f) => f.path.endsWith(".png") || f.path.endsWith(".gif") || f.path.endsWith(".jpeg") || f.path.endsWith(".jpg")
    );

    // upload to ipfs
    console.log("uploading files");
    const _music = await pinFileToIPFS(music);
    const _image = await pinFileToIPFS(cover);

    console.log("uploading metadata");
    const metadata: any = await pinJson({
      name: goody.name,
      description: goody.description,
      image: `ipfs://${_image.IpfsHash}`,
      animation_url: `ipfs://${_music.IpfsHash}`,
      external_url: "https://joinclubspace.xyz",
    });

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
    const { res, clubSpaceId } = await launchSpace(handle, jamApi);

    if (!res) {
      toast.error("Error - cannot make a space right now");
      return;
    }

    // upload content to ipfs
    toast("Setting goody bag...");
    const goodyUri = await uploadToIPFS();
    console.log("goody uri:", goodyUri);

    // create lens post (@TODO: make this part optional)
    const content: any = await pinJson(publicationBody(lensPost, [], defaultProfile.handle));

    toast("Creating Lens post...", { duration: 10000 });
    await makePostGasless(defaultProfile.id, `ipfs://${content.IpfsHash}`, signer, lensLogin.authenticate.accessToken);
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
          decentContractChainId: 80001,
          lensPubId,
          clubSpaceId,
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
      <div>
        <h1 className="mt-4 mb-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Your space is live!</h1>
        <p>{shareUrl}</p>
      </div>
    );
  }

  return (
    <div className="w-full shadow-xl border dark:border-gray-700 border-grey-500 p-8 flex flex-col gap-3 rounded-md">
      {!lensLogin ? (
        <div className="flex gap-4 justify-center md:min-w-[300px]">
          {isConnected ? (
            <button onClick={() => login()} className="btn justify-center items-center">
              Login with lens to create a space
            </button>
          ) : (
            <ConnectWallet showBalance={false} />
          )}
        </div>
      ) : (
        <>
          <SelectPlaylist selectPlaylist={selectPlaylist} playlist={playlist} />
          <SetDecentProduct setDecentProduct={setDecentProduct} productData={productData} />
          <CreateLensPost setPostData={setPostData} defaultProfile={defaultProfile} />
          <SetGoodyBag setGoody={setGoody} />
          <button
            className="btn mt-4"
            onClick={submit}
            disabled={!goody || !playlist || !lensPost || !productData || uploading}
          >
            {uploading ? "Submitting..." : "Create space"}
          </button>

          <form action="" className="step-form">
            <div className="absolute top-[0.5rem] right-[0.5rem]">
              {currenStepIndex + 1} / {steps.length}
            </div>
            {step}
            <div className="mt-4 flex gap-x-2 justify-end">
              <button
                disabled={isFirstStep}
                type="button"
                className="btn disabled:cursor-not-allowed disabled:opacity-50"
                onClick={back}
              >
                Back
              </button>

              <button type="button" className="btn" onClick={next}>
                {isLastStep ? "Finish" : "Next"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreateSpace;
