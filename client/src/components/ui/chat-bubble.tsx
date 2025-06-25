import { cn } from "@/lib/utils";
import { Card } from "./card";
import MarkdownRenderer from "./markdown-renderer";
import React from "react";
import { Textarea } from "./textarea";
import { motion } from "motion/react";
import AttachmentCard from "../attachment-card";

export interface ChatBubbleProps {
  id: string;
  content: string;
  attachments?: Attachment[];
  sender: "user" | "ai";
  avatarSrc?: string;
  className?: string;
  editing: boolean;
  onChange: (x: string) => void;
  highlightCode: boolean;
}

const ChatBubble = React.memo(
  React.forwardRef<HTMLDivElement, ChatBubbleProps>(
    (
      {
        content,
        sender,
        className,
        attachments,
        editing,
        onChange,
        highlightCode,
      },
      ref
    ) => {
      if (sender === "user") {
        return (
          <motion.div
            ref={ref}
            className={cn(
              "flex w-full gap-2 mb-12 group relative group pt-6",
              "justify-end",
              className
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-1 w-full",
                "items-end",
                editing && "w-full"
              )}
            >
              {attachments && attachments.length > 0 && (
                <Card className="px-1 py-1 bg-secondary/50 text-secondary-foreground rounded-br flex flex-row gap-1 items-center overflow-x-auto">
                  {attachments.map((attachment, idx) => (
                    <AttachmentCard key={idx} attachment={attachment} />
                  ))}
                </Card>
              )}
              <Card
                className={cn(
                  "px-3 py-2 break-words max-w-full",
                  "bg-secondary/50 text-secondary-foreground rounded-tr",
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
            </div>
          </motion.div>
        );
      }

      return (
        <div
          ref={ref}
          className={cn(
            "flex w-full gap-2 mb-12 group relative group pt-6",
            "justify-start",
            className
          )}
        >
          <div className={cn("flex flex-col gap-1 w-full")}>
            <div>
              <MarkdownRenderer
                content={content}
                highlightCode={highlightCode}
              />
            </div>
          </div>
        </div>
      );
    }
  )
);
export default ChatBubble;
