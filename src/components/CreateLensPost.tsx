import { useState } from "react";

const CreateLensPost = ({ setPostData }) => {
  const [text, setText] = useState("");

  const url = () => "https://www.joinclubspace.xyz/live/placeholder.lens";

  const fullText = () => `${text} Join: ${url()}`;

  return (
    <div>
      <h2>Share to Lens</h2>
      <div>
        <textarea
          rows={3}
          className="w-72 bg-inherit rounded-xl select-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="flex w-36 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => setPostData(fullText())}
        >
          Save
        </button>
      </div>
      <div>
        <div className="whitespace-pre-line max-w-md p-3 border-white border-2 rounded-xl">{fullText()}</div>
      </div>
    </div>
  );
};

export default CreateLensPost;
