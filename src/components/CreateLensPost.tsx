import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const CreateLensPost = () => {
  const [text, setText] = useState("");

  const url = () => "https://joinclubspace.xyz/handle.lens/uuid";

  return (
    <div>
      <p>Share to Lens</p>
      <div>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div>
        <p>{text + "\n" + url()}</p>
      </div>
    </div>
  );
};

export default CreateLensPost;
