import { MultiStepFormWrapper } from "./MultiStepFormWrapper";

const CreateLensPost = ({ setPostData, defaultProfile, lensPost, updateFields }) => {
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
          Create a Lens Post (Optional)
        </label>
        <textarea
          id="lens-post"
          rows={3}
          className="input"
          value={lensPost}
          placeholder="Join my Club Space!"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </MultiStepFormWrapper>
  );
};

export default CreateLensPost;
