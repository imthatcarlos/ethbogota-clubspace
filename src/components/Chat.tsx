import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { Button, Icons, Textarea } from "./ui";

import { cn } from "@/lib/utils/cn";
import { DefaultLensProfile } from "@/types/lens";
import { useChat } from "@livekit/components-react";
import getLensPictureURL from "@/lib/utils/getLensPictureURL";

type Props = {
  viewerName: string;
};

export default function Chat({ viewerName }: Props) {
  const { chatMessages: messages, send } = useChat();

  const reverseMessages = useMemo(() => messages.sort((a, b) => a.timestamp - b.timestamp), [messages]);

  const [message, setMessage] = useState("");

  const onEnter = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (message.trim().length > 0 && send) {
          send(message).catch((err) => console.error(err));
          setMessage("");
        }
      }
    },
    [message, send]
  );

  const onSend = useCallback(() => {
    if (message.trim().length > 0 && send) {
      send(message).catch((err) => console.error(err));
      setMessage("");
    }
  }, [message, send]);

  const getAvatar = ({ defaultProfile, ensData }) => {
    if (defaultProfile?.metadata) {
      return getLensPictureURL(defaultProfile);
    }
    if (ensData && Object.keys(ensData) && ensData?.avatar) {
      return ensData.avatar;
    }
    return "/anon.png";
  };

  return (
    <div className="relative h-[85%] max-h-[827px] bg-foreground rounded-2xl px-3 py-4 w-full">
      <div className="absolute top-4 bottom-14 overflow-y-auto pb-4 right-0 left-0 p-2">
        {reverseMessages.map((message) => {
          // assuming users have signed in with lens
          const { defaultProfile, ensData }: { defaultProfile: DefaultLensProfile, ensData: any } = JSON.parse(message.from?.metadata);
          const displayName = defaultProfile ? `@${defaultProfile?.handle?.localName}` : message.from?.name;
          const avatar = getAvatar({ defaultProfile, ensData });

          return (
            <div key={message.timestamp} className="flex flex-col p-2 hover:bg-background hover:transition-colors rounded-md">
              <div className="flex justify-between items-center gap-2 p-2">
                <div
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap inline-flex gap-1",
                    viewerName === message.from?.name && "text-primary"
                  )}
                >
                  <img
                    className="h-6 w-6 rounded-full select-none pointer-events-none -ml-2 -mt-2 mr-1"
                    src={avatar}
                    alt={`Avatar of user ${displayName}`}
                  />
                  {displayName}
                  {viewerName === message.from?.name && " (you)"}:
                  <div className="text-xs text-gray-500">
                    {new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))}
                  </div>
                </div>
              </div>
              <div className="text-sm ml-auto">{message.message}</div>
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex w-full gap-2 p-2">
        <Textarea
          value={message}
          className="border-box h-10 border-[#e0e0e0] placeholder:text-[#8d8d8d]"
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onKeyDown={onEnter}
          placeholder="Type a message..."
        />
        <Button disabled={message.trim().length === 0} onClick={onSend} className="bg-primary focus-visible:ring-primary">
          <div className="flex items-center gap-2">
            <Icons.send className="h-4 w-4" />
          </div>
        </Button>
      </div>
    </div>
  );
}
