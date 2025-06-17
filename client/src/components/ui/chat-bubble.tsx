import { cn } from "@/lib/utils";
import { Card } from "./card";
import MarkdownRenderer from "./markdown-renderer";
import { Button } from "./button";
import { Check, Copy, Pen, SendHorizonal, X } from "lucide-react";
import React, { useState } from "react";
import { Textarea } from "./textarea";

export interface ChatBubbleProps {
  id: string;
  content: string;
  attachments?: Attachment[];
  sender: "user" | "ai";
  avatarSrc?: string;
  className?: string;
  onEdit: (messageId: string, content: string) => void;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ id, content, sender, className, attachments, onEdit }, ref) => {
    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(false);
    const [prompt, setPrompt] = useState(content);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        // Optionally handle error
      }
    };

    return (
      <div
        id={`message-${id}`}
        ref={ref}
        className={cn(
          "flex w-full gap-2 mb-12 group relative group pt-6",
          sender === "user" ? "justify-end" : "justify-start",
          className
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-1 w-full",
            sender === "user" && "items-end",
            editing && "w-full"
          )}
        >
          {
            {
              user: (
                <>
                  {attachments && attachments.length > 0 && (
                    <Card className="px-1 py-1 bg-secondary/50 text-secondary-foreground rounded-br flex flex-row gap-2 items-center overflow-x-auto">
                      {attachments.map((attachment, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-30 aspect-square rounded-xl [box-shadow:0px_0px_3px_#e3e3e320] bg-card",
                            "relative before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-t before:from-black/40 before:to-transparent"
                          )}
                        >
                          {attachment.type === "image" ? (
                            <img
                              src={attachment.url}
                              alt="attachment"
                              className="object-cover w-full h-full rounded-xl"
                            />
                          ) : (
                            <span className="text-xs text-center px-1 h-full flex items-center justify-center">
                              {attachment.url.split(".").pop()?.split("?")[0] ||
                                "FILE"}
                            </span>
                          )}
                        </div>
                      ))}
                    </Card>
                  )}
                  <Card
                    className={cn(
                      "px-3 py-2 break-words max-w-full",
                      sender === "user"
                        ? "bg-secondary/50 text-secondary-foreground rounded-tr"
                        : "bg-muted rounded-tl-none",
                      editing && "w-full"
                    )}
                  >
                    {editing ? (
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        placeholder="Type your message..."
                        className="resize-none"
                      />
                    ) : (
                      <pre className="font-newsreader whitespace-pre-line font-[500]">
                        {prompt}
                      </pre>
                    )}
                  </Card>
                </>
              ),
              ai: (
                <div>
                  <MarkdownRenderer content={content} />
                </div>
              ),
            }[sender]
          }
        </div>

        <div className="absolute top-full hidden group-hover:block">
          <div className="mt-2 flex ">
            <Button variant={"ghost"} size={"sm"} onClick={handleCopy}>
              {copied ? <Check className="text-green-400" /> : <Copy />}
            </Button>
            {sender == "user" && (
              <Button
                variant={"ghost"}
                size={"sm"}
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
                size={"sm"}
                onClick={() => {
                  onEdit(id, prompt);
                  setEditing((x) => !x);
                }}
              >
                <SendHorizonal />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);
export default ChatBubble;
