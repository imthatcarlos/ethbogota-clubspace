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

  const reverseMessages = useMemo(() => messages.sort((a, b) => b.timestamp - a.timestamp), [messages]);

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

  return (
    <div className="flex h-[85%] max-h-[827px] overflow-y-auto flex-col space-between bg-foreground rounded-2xl px-3 py-4 w-full">
      <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto pb-4">
        {reverseMessages.map((message) => {
          // assuming users have signed in with lens
          const { defaultProfile }: { defaultProfile: DefaultLensProfile } = JSON.parse(message.from?.metadata);
          const displayName = defaultProfile ? defaultProfile.handle : message.from?.name;

          const avatar = defaultProfile?.picture ? getLensPictureURL(defaultProfile) : "/anon.png";

          return (
            <div key={message.timestamp} className="flex gap-2 p-2 hover:bg-background hover:transition-colors rounded-md">
              <div className="flex gap-2">
                <div
                  className={cn(
                    "text-xs font-semibold whitespace-nowrap inline-flex gap-1",
                    viewerName === message.from?.name && "text-primary"
                  )}
                >
                  <img
                    className="h-5 w-5 rounded-full select-none pointer-events-none -ml-2 mr-1"
                    src={avatar}
                    alt={`Avatar of user ${displayName}`}
                  />
                  {displayName}
                  {viewerName === message.from?.name && " (you)"}:
                  <div className="text-xs text-gray-500">
                    {new Intl.DateTimeFormat('default', { hour: '2-digit', minute: '2-digit' }).format(new Date(message.timestamp))}
                  </div>
                </div>
                <div className="text-sm ml-auto [text-wrap:balance]">{message.message}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex w-full gap-2 self-end">
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
