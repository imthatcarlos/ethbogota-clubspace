import { ConnectWallet } from "@/components/ConnectWallet";
import CreateLensPost from "@/components/CreateLensPost";
import SelectPlaylist from "@/components/SelectPlaylist";
import SetDecentProduct from "@/components/SetDecentProduct";
import { IPlaylist } from "@spinamp/spinamp-sdk";
import { useState, useEffect } from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import toast from 'react-hot-toast'
import SetGoodyBag from "@/components/SetGoodyBag";
import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import axios from "axios";
import { createGroup } from "@/lib/semaphore/semaphore";
import { LENSHUB_PROXY, makePostGasless, makePostTx, publicationBody } from "@/services/lens/createPost";
import { LensHubProxy } from "@/services/lens/abi";
import useLensLogin from "@/hooks/useLensLogin";

const CreateSpace = ({ defaultProfile }) => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const [playlist, setPlaylist] = useState<IPlaylist>();
  const [productData, setProductData] = useState<any>();
  const [lensPost, setLensPost] = useState<any>();
  const [goody, setGoody] = useState<any>();
  const [uploading, setUploading] = useState<boolean>();
  const [shareUrl, setShareUrl] = useState<string>();

  const { data: lensLogin, refetch: login } = useLensLogin();

  const selectPlaylist = (playlist) => {
    setPlaylist(playlist);
  };

  const setDecentProduct = (data) => {
    console.log(data);
    setProductData(data);
  };

  const setPostData = (postData) => {
    setLensPost(postData);
  };

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
    addressOrName: LENSHUB_PROXY,
    contractInterface: LensHubProxy,
    signerOrProvider: signer,
  });

  const submit = async () => {
    setUploading(true);
    console.log(playlist, productData, lensPost, goody);

    // upload content to ipfs
    toast('Setting goody bag...');
    const goodyUri = await uploadToIPFS();
    console.log("goody uri:", goodyUri);

    // create lens post
    const content: any = await pinJson(publicationBody(lensPost, [], defaultProfile.handle));

    toast('Creating Lens post...', { duration: 5000 });
    await makePostGasless(defaultProfile.id, `ipfs://${content.IpfsHash}`, signer, lensLogin.authenticate.accessToken);
    const pubCount = await contract.getPubCount(defaultProfile.id);
    const lensPubId = pubCount.toHexString();

    toast.promise(
      new Promise(async (resolve, reject) => {
        // call redis api
        const spaceData = {
          creatorAddress: address,
          creatorLensHandle: defaultProfile.handle,
          creatorLensProfileId: defaultProfile.id,
          spinampPlaylistId: playlist.id,
          decentContractAddress: productData.address,
          decentContractChainId: 80001,
          lensPubId,
        };
        const { data: { url, semGroupIdHex } } = await axios.post(`/api/space/create`, spaceData);

        // call sempahore/create-group
        await createGroup(semGroupIdHex, goodyUri, lensPubId, defaultProfile.id);

        // PUSH
        await axios.post(`/api/push/send`, { url });

        setUploading(false);

        setShareUrl(url);

        resolve();
      }),
      {
        loading: 'Finalizing your space...',
        success: 'Success!',
        error: (error) => {
          console.log(error);
          setUploading(false);
          return 'Error!'
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
      {
        !lensLogin
          ? (
              <div className="flex gap-4 justify-center md:min-w-[300px]">
                {
                  isConnected
                    ? <button onClick={() => login()} className="btn justify-center items-center">
                        Login with lens to create a space
                      </button>
                    : <ConnectWallet showBalance={false} />
                }
              </div>
            )
          : <>
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
            </>
      }
    </div>
  );
};

export default CreateSpace;
