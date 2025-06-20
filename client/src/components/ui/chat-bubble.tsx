import { cn } from "@/lib/utils";
import { Card } from "./card";
import MarkdownRenderer from "./markdown-renderer";
import React from "react";
import { Textarea } from "./textarea";

export interface ChatBubbleProps {
  id: string;
  content: string;
  attachments?: Attachment[];
  sender: "user" | "ai";
  avatarSrc?: string;
  className?: string;
  editing: boolean;
  onChange: (x: string) => void;
}

const ChatBubble = React.forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ id, content, sender, className, attachments, editing, onChange }, ref) => {
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
                        value={content}
                        onChange={(e) => onChange(e.target.value)}
                        rows={5}
                        placeholder="Type your message..."
                        className="resize-none"
                      />
                    ) : (
                      <pre className="font-newsreader whitespace-pre-line font-[500]">
                        {content}
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
      </div>
    );
  }
);
export default ChatBubble;
