import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";

const allowableImageTypes = [".png", ".gif", ".jpeg", ".jpg"];

const SetGoodyBag = ({ setGoody, goodyName, goodyDesc, updateFields, goodyFiles }) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      const _files = acceptedFiles.map((file: any) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      updateFields({ goodyFiles, _files });
      onChange({ name: goodyName, description: goodyDesc, files: _files });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goodyDesc, goodyFiles, goodyName, updateFields]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject, acceptedFiles } = useDropzone({
    onDrop,
    accept: { "audio/*": [".wav", ".mp3"], "image/*": allowableImageTypes },
    maxFiles: 2,
    maxSize: 50000000,
  });

  // TODO: styles
  const style = useMemo(() => {
    return isDragAccept
      ? "p-8 border-dotted border-2 border-green-600"
      : isDragReject
      ? "p-8 border-dotted border-2 border-red-600"
      : isDragActive
      ? "p-8 border-dotted border-2 border-indigo-600"
      : "p-8 border-dotted border-2";
  }, [isDragActive, isDragReject, isDragAccept]);

  const onChange = ({ name, description, files }) => {
    updateFields({ goodyName: name, goodyDesc: description, goodyFiles: files });
    setGoody({ name, description, files });
  };

  const thumbs = goodyFiles
    .filter(({ path }) => allowableImageTypes.some((type) => path.includes(type)))
    .map((file) => (
      <div className="inline-flex p-2" key={file.name}>
        <div className="flex min-w-0 overflow-hidden">
          <img
            alt=""
            src={file.preview}
            className="block w-auto h-full"
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
          />
        </div>
      </div>
    ));

  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-3">
        <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">Create a Goody Bag</h2>
        <div className="w-full flex flex-col gap-3">
          <input
            type="text"
            className="input"
            placeholder="Name..."
            value={goodyName}
            onChange={(e) => onChange({ name: e.target.value, description: goodyDesc, files: goodyFiles })}
            required
          />
          <textarea
            rows={3}
            className="input"
            value={goodyDesc}
            onChange={(e) => onChange({ description: e.target.value, name: goodyName, files: goodyFiles })}
            placeholder="Description..."
            required
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
          <aside className="flex flex-wrap mt-1">{thumbs}</aside>
        </div>
      </div>
    </MultiStepFormWrapper>
  );
};

export default SetGoodyBag;
