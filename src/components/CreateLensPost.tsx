import { useState } from "react";

const CreateLensPost = ({ setPostData, defaultProfile }) => {
  const [text, setText] = useState("");

  const url = () => `https://www.joinclubspace.xyz/live/${defaultProfile}`;

  const fullText = () => `${text} Join: ${url()}`;

  const onChange = (_text) => {
    setText(_text);
    setPostData(fullText());
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <label htmlFor="lens-post" className="text-md font-bold tracking-tight sm:text-lg md:text-xl">
        Create a Lens Post
      </label>
      <textarea
        id="lens-post"
        rows={3}
        className="input"
        value={text}
        placeholder="Join my Club Space!"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default CreateLensPost;
