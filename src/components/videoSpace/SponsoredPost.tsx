import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { getPost } from "@/services/lens/getPost";
import { parsePublicationLink } from "@/utils";
import PinnedLensPost from "../PinnedLensPost";

export default ({ space }) => {
  const [lensPost, setLensPost] = useState(null);
  const [lensPubId, setLensPubId] = useState(null);

  useMemo(async () => {
    const pubId = parsePublicationLink(space.pinnedLensPost);
    const post = await getPost(pubId);

    if ((post?.profile || post?.by) && post?.metadata) {
      if (post?.by) post.profile = post.by; // HACK
      setLensPubId(pubId);
      setLensPost(post);
    }
  }, [space]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="rounded-t-2xl min-w-[20rem] max-w-full max-h-[7.8rem] bg-black m-auto p-4 -mt-4 drop-shadow-sm cursor-pointer">
          <div className="flex mb-3">
            <span className="text-gray-500 text-sm">post by @{lensPost?.profile?.handle.localName}</span>
          </div>
          <p className="mb-2 truncate max-h-[2.5rem] pb-1 overflow-hidden line-clamp-2 text-left pb-2">{lensPost?.metadata?.content}</p>
          <p className="text-xs text-club-red absolute right-4 bottom-2">See more</p>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg md:max-w-xl max-h-screen">
        <DialogHeader>
          <DialogDescription className="space-y-4">
            {lensPost && (
              <PinnedLensPost
                url={space.pinnedLensPost}
                small={false}
                pubData={lensPost}
              />
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
