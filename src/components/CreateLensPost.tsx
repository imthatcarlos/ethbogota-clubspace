import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import { IS_PRODUCTION } from '@/lib/consts';

const CreateLensPost = ({ setPostData, defaultProfile, lensPost, pinnedLensPost, updateFields }) => {
  const url = () => `https://www.joinclubspace.xyz/live/${defaultProfile.handle}`;

  const fullText = (_text: string) => `${_text} ${url()}`;

  const onChange = (_text: string) => {
    updateFields({ lensPost: _text });
    setPostData(fullText(_text));
  };

  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-3">
        <label htmlFor="lens-post" className="text-md font-bold tracking-tight sm:text-lg md:text-xl">
          Create a Lens post to promote your space (Optional)
        </label>
        <textarea
          id="lens-post"
          rows={3}
          className="input"
          value={lensPost}
          placeholder="[the link to your space will be included in the body]"
          onChange={(e) => onChange(e.target.value)}
        />

        <label htmlFor="lens-post" className="text-md font-bold tracking-tight sm:text-lg md:text-xl">
          Add a pinned Lens Post to your space (Optional)
        </label>
        <input
          value={pinnedLensPost}
          type="text"
          id="pinned_post_link"
          className="input"
          placeholder={`https://${IS_PRODUCTION ? '' : 'testnet.'}lenster.xyz/posts/0x21c0-0x0d`}
          onChange={(e) => updateFields({pinnedLensPost: e.target.value})}
        />
      </div>
    </MultiStepFormWrapper>
  );
};

export default CreateLensPost;
