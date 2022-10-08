import { useState } from "react";

const CreateLensPost = ({ setPostData }) => {
  const [text, setText] = useState("");

  const url = () => "https://www.joinclubspace.xyz/live/placeholder.lens";

  const fullText = () => `${text} Join: ${url()}`;

  const onChange = (_text) => {
    setText(_text)
    setPostData(fullText())
  }

  return (
    <div>
      <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Create a Lens Post</h2>
      <div>
        <textarea
          rows={3}
          className="block mt-4 w-fullI rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={text}
          placeholder="Join my Club Space!"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CreateLensPost;
