import React, { useEffect, useState } from "react";
import { ChatBubbleProps } from "@/components/ui/chat-bubble";
import db from "@/dexie";
import { liveQuery } from "dexie";
import TypingIndicator from "@/components/ui/typing-indicator";
import { useMessageStreaming } from "@/hooks/use-message-streaming";
import { Button } from "@/components/ui/button";
import { Check, Copy, Pen, SendHorizonal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import RegenOptions from "@/components/regen-options";

interface WithMessageListenerProps {
  chatId: string;
  messageId: string;
  onEdit?: (messageId: string, chatId: string) => void;
}

function withMessageListener(
  WrappedComponent: React.ForwardRefExoticComponent<
    ChatBubbleProps & React.RefAttributes<HTMLDivElement>
  >
) {
  return React.forwardRef<HTMLDivElement, WithMessageListenerProps>(
    function WrapperComponent({ chatId, messageId, onEdit }, ref) {
      const [message, setMessage] = useState<MessageType | null>(null);
      const [messsageContent, setMessageContent] = useState(
        message?.text ?? ""
      );
      const { streamingData } = useMessageStreaming(messageId);
      const [copied, setCopied] = useState(false);
      const [editing, setEditing] = useState(false);
      const handleCopy = async () => {
        if (!message || !message.text) return;

        await navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      };

      useEffect(() => {
        const subscription = liveQuery(async () =>
          db.messages.where({ chatId, id: messageId }).toArray()
        ).subscribe({
          next: (messages) => {
            const msg = messages[0];
            setMessage(msg ?? null);
          },
          error: (error) => {
            console.error("Error fetching messages:", error);
          },
        });

        return () => {
          setMessage(null);
          subscription.unsubscribe();
        };
      }, [chatId, messageId]);

      useEffect(() => {
        if (message && message.text) {
          setMessageContent(message.text);
        }
      }, [message?.text]);

      if (!message) return null;

      const injectedProps: ChatBubbleProps = {
        id: message.id,
        content: streamingData?.isStreaming
          ? streamingData.content
          : messsageContent,
        sender: message.role,
        attachments: message.attachments,
        editing: editing,
        onChange: (x: string) => setMessageContent(x),
      };

      if (message.status === "typing") {
        return <TypingIndicator key={message.id} id={message.id} />;
      } else if (message.status === "pending" || message.status === "done")
        return (
          <div className="relative ">
            <WrappedComponent {...injectedProps} ref={ref} />
            {!streamingData?.isStreaming && (
              <div
                className={cn(
                  "absolute top-full block",
                  message.role == "user" && "right-0"
                )}
              >
                <div className="mt-2 flex ">
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="[&>svg]:size-4!"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="text-green-400" /> : <Copy />}
                  </Button>
                  {message.role == "ai" && (
                    <RegenOptions messageId={messageId} chatId={chatId} />
                  )}
                  {message.role == "user" && (
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="[&>svg]:size-4!"
                      onClick={() => {
                        setEditing((x) => !x);
                      }}
                    >
                      {editing ? <X /> : <Pen />}
                    </Button>
                  )}
                  {editing && (
                    <Button
                      variant={"ghost"}
                      size={"icon"}
                      className="[&>svg]:size-4!"
                      onClick={() => {
                        onEdit && onEdit(messageId, messsageContent);
                        setEditing((x) => !x);
                      }}
                    >
                      <SendHorizonal />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      else if (message.status === "failed") {
        return <p key={message.id}>Some error occurred</p>;
      }
      return null; // Handle any other status
    }
  );
}

export default withMessageListener;
