import { getPost } from "@/services/lens/getPost";
import { useMemo, useState } from "react";
import { getUrlForImageFromIpfs } from "@/utils";

const PinnedLensPost = ({ url, small }) => {
  const [lensPost, setLensPost] = useState(null);

  useMemo(async () => {
    const parts = url.split("/");
    const post = await getPost(parts[parts.length - 1]);
    setLensPost(post);
  }, [url]);

  console.log("component", lensPost);

  if (small) {
    return (
      <div className="rounded-md w-[17rem] bg-black m-auto p-3 truncate">
        <p>Pinned Lens Post:</p>
        <a href={url} className="underline" target="_blank" referrerPolicy="no-referrer">
          {url}
        </a>
      </div>
    );
  }

  return (
    <>
      <h2 className="my-4 text-4xl font-bold tracking-tight sm:text-2xl md:text-5xl drop-shadow-sm text-center">
        Pinned Lens Post
      </h2>
      <div className="rounded-md w-[17rem] h-[17rem] bg-black m-auto p-3 truncate">
        <a href={url} className="" target="_blank" referrerPolicy="no-referrer">
          <div className="flex mb-4">
            <img
              src={getUrlForImageFromIpfs(lensPost?.profile.picture.original.url) ?? "/anon.png"}
              alt="Profile Picture"
              height={40}
              width={40}
              className="object-cover rounded-full"
              loading="lazy"
            />
            <span className="mt-2 ml-2">{lensPost?.profile.name}</span>
          </div>
          <p>{lensPost?.metadata.content}</p>
        </a>
      </div>
    </>
  );
};

export default PinnedLensPost;
