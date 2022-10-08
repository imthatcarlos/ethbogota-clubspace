import { pinFileToIPFS, pinJson } from "@/services/pinata/pinata";
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";

const SetGoodyBag = ({ setGoody }) => {
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const _files = acceptedFiles.map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );
    setFiles(_files);
    onChange({ name, description, files: _files });
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
      ? "p-8 border-dotted border-2 max-w-md border-green-600 mt-4"
      : isDragReject
      ? "p-8 border-dotted border-2 max-w-md border-red-600 mt-4"
      : isDragActive
      ? "p-8 border-dotted border-2 max-w-md border-indigo-600 mt-4"
      : "p-8 border-dotted border-2 max-w-md mt-4";
  }, [isDragActive, isDragReject, isDragAccept]);

  const onChange = ({ name, description, files }) => {
    setName(name);
    setDescription(description);

    setGoody({ name, description, files });
  };

  return (
    <div>
      <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Create a Goody Bag</h2>
      <div>
        <input
          type="text"
          className="block w-fullI mt-4 rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Name..."
          value={name}
          onChange={(e) => onChange({ name: e.target.value, description, files })}
        />
        <textarea
          rows={3}
          className="block w-fullI mt-4 rounded-md dark:bg-gray-800 dark:text-white dark:border-gray-600 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={description}
          onChange={(e) => onChange({ description: e.target.value, name, files })}
          placeholder="Description..."
        />
        <div {...getRootProps()} className={style}>
          <input {...getInputProps()} />
          {acceptedFiles.length === 0 ? (
            <>
              <p>Drag and drop your song and a cover image here</p>
              <p>(max: 50mb)</p>
            </>
          ) : (
            acceptedFiles.map((f) => <p key={(f as any).path}>{(f as any).path}</p>)
          )}
        </div>
      </div>
    </div>
  );
};

export default SetGoodyBag;
