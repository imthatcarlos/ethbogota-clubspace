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
      <h2>Share to Lens</h2>
      <div>
        <textarea
          rows={3}
          className="w-72 bg-inherit rounded-xl select-none"
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div>
        <div className="whitespace-pre-line max-w-md p-3 border-white border-2 rounded-xl">{fullText()}</div>
      </div>
    </div>
  );
};

export default CreateLensPost;
