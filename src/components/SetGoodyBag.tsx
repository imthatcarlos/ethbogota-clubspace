import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const SetGoodyBag = ({ setGoodyBag }) => {
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(
      acceptedFiles.map((file: any) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles } = useDropzone({
    onDrop,
    accept: { "audio/*": [".wav", ".mp3"], "image/*": [".png", ".gif", ".jpeg", ".jpg"] },
    maxFiles: 2,
    maxSize: 50000000,
  });

  // TODO: styles
  const style = useMemo(() => {
    return isDragAccept
      ? "p-8 border-dotted border-2 max-w-md border-green-600"
      : isDragReject
      ? "p-8 border-dotted border-2 max-w-md border-red-600"
      : isDragActive
      ? "p-8 border-dotted border-2 max-w-md border-indigo-600"
      : "p-8 border-dotted border-2 max-w-md";
  }, [isDragActive, isDragReject, isDragAccept]);

  const uploadToIPFS = async () => {
    setUploading(true);
    // pick out files
    const music = files.find((f) => f.path.endsWith(".wav") || f.path.endsWith(".mp3"));
    const cover = files.find(
      (f) => f.path.endsWith(".png") || f.path.endsWith(".gif") || f.path.endsWith(".jpeg") || f.path.endsWith(".jpg")
    );

    // upload to ipfs
    const _music = await pinFileToIPFS(music);
    const _image = await pinFileToIPFS(cover);

    const metadata: any = await pinJson({
      name,
      description,
      image: `ipfs://${_image.IpfsHash}`,
      animation_url: `ipfs://${_music.IpfsHash}`,
      external_url: "https://madfinance.xyz",
    });

    setGoodyBag(`ipfs://${metadata.IpfsHash}`);
    setUploading(false);
  };

  return (
    <div>
      <h2>Create a Goody Bag</h2>
      <div>
        <input
          type="text"
          className="bg-gray-50 border"
          placeholder="Name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          rows={3}
          className="w-72 bg-inherit rounded-xl select-none"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description..."
        />
        <div>
          {acceptedFiles.map((f) => (
            <p key={(f as any).path}>{(f as any).path}</p>
          ))}
        </div>
        <div {...getRootProps()} className={style}>
          <input {...getInputProps()} />
          <p>Drag and drop your song and a cover image here</p>
          <p>(max: 50mb)</p>
        </div>
        <button
          className="flex w-36 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => uploadToIPFS()}
          disabled={uploading || acceptedFiles.length !== 2}
        >
          Upload Goody Bag
        </button>
      </div>
    </div>
  );
};

export default SetGoodyBag;
