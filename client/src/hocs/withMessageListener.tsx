import React, { useEffect, useState } from "react";
import { ChatBubbleProps } from "@/components/ui/chat-bubble";
import db from "@/dexie";
import { liveQuery } from "dexie";
import TypingIndicator from "@/components/ui/typing-indicator";
import { useMessageStreaming } from "@/hooks/use-message-streaming";

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
      const { streamingData } = useMessageStreaming(messageId);

      console.log("LISTENER: ", streamingData?.content);

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

      if (!message) return null;

      const injectedProps: ChatBubbleProps = {
        id: message.id,
        content: streamingData?.isStreaming
          ? streamingData.content
          : message.text,
        sender: message.role,
        attachments: message.attachments,
        onEdit: (messageId: string, content: string) => {
          if (onEdit) onEdit(messageId, content);
        },
      };

      if (message.status === "typing") {
        return <TypingIndicator key={message.id} id={message.id} />;
      } else if (message.status === "pending" || message.status === "done")
        return <WrappedComponent {...injectedProps} ref={ref} />;
      else if (message.status === "failed") {
        return <p key={message.id}>Some error occurred</p>;
      }
      return null; // Handle any other status
    }
  );
}

export default withMessageListener;
