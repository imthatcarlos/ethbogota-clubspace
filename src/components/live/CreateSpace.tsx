import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import toast from "react-hot-toast";
import { formatProfilePicture } from "@madfi/widgets-react";

import CreateSpaceForm from "./CreateSpaceForm";
import { useAuthenticatedProfile } from "@/hooks/useLensLogin";
import { defaultGatewayURL } from "@/utils";
import publicationBody from "@/services/lens/publicationBody";
import { addJSON, storjGatewayURL } from "@/services/storj/storj";
import { createPostMomoka } from "@/services/lens/createPost";

type MultiFormData = {
  launchDate: Date | undefined;
  roomName: string;
  description: string;
  invitedHandles: string[];
};

const INITIAL_DATA: MultiFormData = {
  launchDate: undefined,
  roomName: "",
  description: "",
  invitedHandles: [],
};

export default () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: authenticatedProfile } = useAuthenticatedProfile();

  const [uploading, setUploading] = useState<boolean>();

  const [formData, setFormData] = useState(INITIAL_DATA);

  const updateFields = (fields: Partial<MultiFormData>) => {
    setFormData((prev) => {
      return { ...prev, ...fields };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createSpace();
  };

  const createSpace = async () => {
    setUploading(true);

    try {
      const { roomName, launchDate, invitedHandles, description } = formData;

      const handle = authenticatedProfile?.handle?.localName || address;

      let toastId = toast.loading("Creating your stream...");

      const response = await fetch(`/api/space/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorAddress: address,
          creatorLensHandle: authenticatedProfile?.handle?.localName,
          creatorAvatar: formatProfilePicture(authenticatedProfile!).metadata.picture.url,
          creatorBanner: authenticatedProfile?.metadata?.coverPicture?.optimized?.uri || defaultGatewayURL(authenticatedProfile?.metadata?.coverPicture?.raw?.uri),
          handle,
          creatorLensProfileId: authenticatedProfile?.id,
          startAt: launchDate,
          spaceType: "video",
          roomName,
          enableRecording: true, // needed for hls playback
          invitedHandles: invitedHandles.length ? invitedHandles.join(",") : undefined,
        })
      });

      if (!response.ok) {
        toast.error("Could not create space");
        setUploading(false);
        return;
      }

      const data = await response.json();
      const { url, endAt, playbackURL } = data;

      await handleCreatePost({
        roomName,
        description,
        playbackUrl: playbackURL,
        startsAt: launchDate ? new Date(launchDate * 1000).toISOString() : undefined,
        endsAt: endAt ? new Date(endAt * 1000).toISOString() : undefined,
        shareUrl: url,
      });

      toast.success("Livestream ready", { duration: 5000, id: toastId });
      setUploading(false);
    } catch (error) {
      console.log(error);
      toast.error("An error has ocurred");
      setUploading(false);
    }
  };

  const handleCreatePost = async (config) => {
    const { roomName, description } = config;

    const content = `**${roomName}**
${description}`;

    const publicationMetadata = publicationBody(
      content,
      [],
      authenticatedProfile.metadata?.displayName || authenticatedProfile.handle!.suggestedFormatted.localName,
      config
    );

    // TODO: encrypt with orb api with club
    const { data: postIpfsHash } = await addJSON(publicationMetadata);

    const broadcastResult = await createPostMomoka(
      walletClient,
      storjGatewayURL(`ipfs://${postIpfsHash}`),
      authenticatedProfile,
    );

    if (!broadcastResult) throw new Error("Failed to create post");
  };

  return (
    <form className="create-space-form">
      <CreateSpaceForm
        updateFields={updateFields}
        roomName={formData.roomName}
        description={formData.description}
        invitedHandles={formData.invitedHandles}
      />
      <div className="flex gap-x-4 justify-end fixed bottom-4 md:right-24 right-12">
        <button
          type="submit"
          className="btn disabled:cursor-not-allowed disabled:opacity-50"
          disabled={uploading || !formData.roomName}
          onClick={handleSubmit}
        >
          {uploading ? "Launching..." : "Launch Livestream"}
        </button>
      </div>
    </form>
  );
};
