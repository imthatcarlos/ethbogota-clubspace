import { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import { ImageUploader } from "./ImageUploader";

const allowableImageTypes = [".png", ".gif", ".jpeg", ".jpg"];

const SetGoodyBag = ({ setGoody, goodyName, goodyDesc, updateFields, goodyFiles }) => {
  const setFiles = (files) => updateFields({ goodyFiles: files });

  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-2">
        <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">6. Create a Party Favor NFT [OPTIONAL]</h2>
        <p>A Party Favor NFT is free gift for anyone who attends your space, and is claimable during the space</p>
        <i className="text-sm mt-2 mb-2">The track list for the space will be included in the NFT description</i>
        <div className="w-full flex flex-col gap-3">
          <input
            type="text"
            className="input"
            placeholder="Give your NFT a title"
            value={goodyName}
            onChange={(e) => updateFields({ goodyName: e.target.value })}
          />
          <div className="mt-4 space-y-2">
            <ImageUploader files={goodyFiles} setFiles={setFiles} maxFiles={1} />
          </div>
        </div>
      </div>
    </MultiStepFormWrapper>
  );
};

export default SetGoodyBag;
