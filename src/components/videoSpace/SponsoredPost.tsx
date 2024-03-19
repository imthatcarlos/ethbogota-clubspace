import { useMemo, useState } from "react";
import { useSupportedActionModule } from "@madfi/widgets-react";
import { useWalletClient } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { getPost } from "@/services/lens/getPost";
import { parsePublicationLink } from "@/utils";
import { LENS_ENVIRONMENT } from "@/services/lens/client";
import { useAuthenticatedProfileId } from "@/hooks/useLensLogin";
import PinnedLensPost from "../PinnedLensPost";
import { Button } from "@/components/ui";

export default ({ space }) => {
  const { data: walletClient } = useWalletClient();
  const { data: authenticatedProfileId } = useAuthenticatedProfileId();
  const [lensPost, setLensPost] = useState(null);
  const [lensPubId, setLensPubId] = useState(null);
  const [isTipping, setIsTipping] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);

  const {
    isActionModuleSupported,
    actionModuleHandler,
  } = useSupportedActionModule(
    LENS_ENVIRONMENT,
    lensPost,
    authenticatedProfileId,
    walletClient
  );

  useMemo(async () => {
    if (!space.pinnedLensPost) return;

    const pubId = parsePublicationLink(space.pinnedLensPost);
    const post = await getPost(pubId);

    if ((post?.profile || post?.by) && post?.metadata) {
      if (post?.by) post.profile = post.by; // HACK
      setLensPubId(pubId);
      setLensPost(post);
    }
  }, [space]);

  const tippingEnabled = useMemo(() => {
    if (isActionModuleSupported) {
      const { metadata, displayName } = actionModuleHandler.getActionModuleConfig();
      return metadata?.name === "TipActionModule" || displayName === "Tip";
    }
  }, [isActionModuleSupported, actionModuleHandler]);

  // TODO: ADS
  if (!space.pinnedLensPost) return (
    <div className="rounded-t-2xl min-w-[20rem] max-w-full min-h-[3rem] bg-black m-auto p-4 -mt-4 drop-shadow-sm cursor-pointer">
    </div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="rounded-t-2xl min-w-[20rem] max-w-full max-h-[7.8rem] bg-black m-auto p-4 -mt-4 drop-shadow-sm cursor-pointer">
          {/* regular post preview */}
          {!tippingEnabled && (
            <>
              <div className="flex mb-3">
                <span className="text-gray-500 text-sm">post by @{lensPost?.profile?.handle.localName}</span>
              </div>
              <p className="mb-2 truncate max-h-[2.5rem] pb-1 overflow-hidden line-clamp-2 text-left pb-2">{lensPost?.metadata?.content}</p>
              <p className="text-xs text-club-red absolute right-4 bottom-2">See more</p>
            </>
          )}
          {/* tips */}
          {tippingEnabled && (
            <>
              <div className="flex mb-3">
                <p className="mb-2 truncate max-h-[2.5rem] pb-1 overflow-hidden line-clamp-3 text-left pb-2">{lensPost?.metadata?.content}</p>
              </div>
              <p className="text-xs text-club-red absolute right-4 bottom-2">Tip $bonsai</p>
            </>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-screen">
        <DialogHeader>
          <DialogDescription className="space-y-4">
            {lensPost && !tippingEnabled && (
              <PinnedLensPost
                url={space.pinnedLensPost}
                small={false}
                pubData={lensPost}
              />
            )}
            {tippingEnabled && (
              <>
                <h2 className="my-4 text-3xl font-bold tracking-tight sm:text-2xl md:text-4xl drop-shadow-sm text-center drop-shadow-sm">
                  Send a $bonsai tip
                </h2>
                <div className="flex justify-center mb-4 text-sm gap-x-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center my-3 px-3">
                      <Button variant={selectedAmount === 50 ? "default" : "white"} onClick={() => setSelectedAmount(50)} disabled={isTipping}>
                        50
                      </Button>
                    </div>
                    <div className="text-center my-3 px-3">
                      <Button variant={selectedAmount === 100 ? "default" : "white"} onClick={() => setSelectedAmount(100)} disabled={isTipping}>
                        100
                      </Button>
                    </div>
                    <div className="text-center my-3 px-3">
                      <Button variant={selectedAmount === 250 ? "default" : "white"} onClick={() => setSelectedAmount(250)} disabled={isTipping}>
                        250
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
