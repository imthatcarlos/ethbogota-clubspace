import { FC } from "react";

export const reactionsMap = {
  clap: "👏",
  heart: "❤️",
  fire: "🔥",
  rocket: "🚀",
  star: "⭐",
  party: "🎉",
  money: "💰",
  thumbsup: "👍",
};

export const reactionsEntries = Object.entries(reactionsMap);
const reactionsKeys = Object.keys(reactionsMap);

export type ReactionsTypes = keyof typeof reactionsMap;

type Props = {
  picture: string;
  handle: string;
  reaction?: { type: string; handle: string; reactionUnicode: string };
};

export const LensProfile: FC<Props> = ({ picture, handle, reaction }) => {
  return (
    <div className="flex items-center justify-center flex-col max-w-[80px] relative">
      <img src={picture} alt={handle} className="rounded-full w-12 h-12 aspect-square" />
      <p className="text-xs truncate">{handle}</p>
      {reaction && (
        <div className="absolute bottom-0 right-0">
          <div className="opacity-0 flex items-center justify-center w-6 h-6 text-4xl rounded-full animate-fade-in-and-out-up">
            {reaction.reactionUnicode}
          </div>
        </div>
      )}
    </div>
  );
};
