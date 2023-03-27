import { useEffect } from "react";
import { MultiStepFormWrapper } from "./MultiStepFormWrapper";
import {
  TIER_OPEN,
  TIER_GATED_LENS_COLLECT,
  LENS_COLLECT_PAYMENT_TOKENS,
  CLUBSPACE_SERVICE_FEE_PCT,
} from "@/lib/consts";
import { ImageUploader } from "./ImageUploader";

const CreateLensPost = ({
  setPostData,
  defaultProfile,
  lensPost,
  updateFields,
  spaceTier,
  collectCurrency,
  collectFee,
  fullLensPost,
  files,
  setFiles,
}) => {
  const fullText = ({ lensPost, collectFee, collectCurrency }) => (
    `🎧 ClubSpace 🎧 \n${lensPost}\n${
      spaceTier === TIER_GATED_LENS_COLLECT ? `Collect this post to join 👇 [${collectFee} ${collectCurrency?.symbol}]\n` : ''
    }${`https://www.joinclubspace.xyz/live/${defaultProfile.handle}`}`
  );

  const onChange = (data) => {
    updateFields(data);
    setPostData(fullText({ lensPost, collectFee, collectCurrency, ...data }));
  };

  useEffect(() => {
    // set the first one as the default
    if (!collectCurrency?.symbol) {
      updateFields({ collectCurrency: LENS_COLLECT_PAYMENT_TOKENS[0] })
    }
  }, [collectCurrency]);

  return (
    <MultiStepFormWrapper>
      <div className="w-full flex flex-col gap-2">
        <h2 className="mt-4 text-md font-bold tracking-tight sm:text-lg md:text-xl">
          4. Create a Lens post{spaceTier === TIER_OPEN ? ' [OPTIONAL]': ' with a Collect fee'}
        </h2>
        <p className="mb-4">
          {
            spaceTier === TIER_OPEN
              ? 'Promote your space by creating a Lens post, which will inlude the link to your live space.'
              : `This is the post that listeners will need to collect to join your live space. ClubSpace will take a ${CLUBSPACE_SERVICE_FEE_PCT}% service fee on each collect.`
          }
        </p>
        <label htmlFor="lens-post" className="inline-block text-sm font-medium text-secondary">
          Post body
        </label>
        <textarea
          id="lens-post"
          rows={3}
          className="input"
          value={lensPost}
          placeholder=""
          onChange={(e) => onChange({ lensPost: e.target.value })}
        />
      </div>
      {spaceTier === TIER_GATED_LENS_COLLECT && (
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <p className="text-sm font-medium">Currency</p>
            <div className="flex gap-4 max-w-fit flex-wrap">
              {LENS_COLLECT_PAYMENT_TOKENS.map((token, idx) => (
                <div onClick={() => onChange({ collectCurrency: token })}>
                  <label
                    key={token.address}
                    htmlFor={token.address}
                    className="mt-2 text-sm text-secondary flex items-center justify-center gap-2 bg-dark-grey rounded-md p-2 min-w-[100px]"
                  >
                    <span>{token.symbol}</span>
                    <input
                      type="radio"
                      className="h-5 w-5 border-none text-[color:var(--club-red)] focus:ring-0"
                      value={token.address}
                      id={token.address}
                      checked={collectCurrency?.symbol === token.symbol}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:col-span-3 flex flex-col">
            <div className="flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="budget" className="inline-block text-sm font-medium text-secondary">
                  Price
                </label>
              </div>
              <div >
                <input
                  type="number"
                  className="input"
                  value={collectFee}
                  onChange={(e) => onChange({ collectFee: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex p-6 border border-dark-grey rounded-lg mt-8">
        <div className="flex-shrink-0">
          <img
            src={defaultProfile?.picture?.original?.url || ""}
            alt={defaultProfile?.id}
            alt="Avatar"
            className="rounded-full w-12 h-12"
          />
        </div>
        <div className="ml-4">
          <div className="font-bold">{defaultProfile?.name || ""}</div>
          <div className="text-gray-600">@{defaultProfile?.handle}</div>
          <p className="mt-2 whitespace-pre-line text-lg overflow-wrap break-all text-ellipsis">
            {fullLensPost}
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-2">
        <ImageUploader files={files} setFiles={setFiles} maxFiles={1} />
      </div>
    </MultiStepFormWrapper>
  );
};

export default CreateLensPost;
