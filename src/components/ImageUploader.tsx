import { PhotographIcon } from "@heroicons/react/solid";
import { FC, ReactNode, SetStateAction, useCallback } from "react";
import Dropzone from "react-dropzone";
import { toast } from "react-hot-toast";

interface ImageUploaderProps {
  files: any[];
  setFiles: (value: SetStateAction<any[]>) => void;
  children?: ReactNode;
  maxFiles?: number;
}

export const ImageUploader: FC<ImageUploaderProps> = ({ files, setFiles, maxFiles = 6, ...rest }) => {
  const onDrop = (acceptedFiles: any[]) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`You can only upload ${maxFiles} images`);
        return;
      }
      setFiles([
        ...files,
        ...acceptedFiles.map((file: any) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          }),
        ),
      ]);
    };

  const removeFile = (event, file: any) => {
    event?.preventDefault();
    setFiles(files.filter((f) => f !== file));
  };

  return (
    <>
      <Dropzone
        accept={{ "image/*": [".png", ".gif", ".jpeg", ".jpg"] }}
        onDrop={onDrop}
        maxFiles={maxFiles}
        maxSize={8000000}
        {...rest}
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps()}
            className={
              `flex flex-col items-center justify-center border-4 rounded-md border-spacing-5 border-dashed rounded-xs transition-all h-40 cursor-pointer border-dark-grey ${files.length ? "shadow-xl" : ""}`
            }
          >
            <input {...getInputProps()} />

            {
              files?.length
                ? (
                    <div className="reveal-on-hover relative">
                      <img className="object-cover rounded-md w-[17.3rem] h-28" src={files[0].preview} alt={files[0].name} />
                      <button className="-mt-8 bg-black/75 absolute h-8 show-on-hover w-full" onClick={(e) => removeFile(e, files[0])}>
                        Remove
                      </button>
                    </div>
                  )
                : (
                    <div className="text-secondary flex items-center flex-col">
                      <PhotographIcon width={50} height={50} />
                      <p className="font-bold text-xl">
                        {files.length === maxFiles ? (
                          "You've reached the limit"
                        ) : (
                          <>
                            {
                              maxFiles === 1
                                ? 'Add an image/gif'
                                : `Add up to ${maxFiles - files.length} ${files.length === 0 ? "" : "more"} image
                                ${maxFiles - files.length === 1 ? "" : "s"}`
                            }
                          </>
                        )}
                      </p>
                    </div>
                  )
            }
          </div>
        )}
      </Dropzone>
    </>
  );
};
