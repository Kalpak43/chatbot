import { useAppDispatch, useAppSelector } from "@/app/hooks";
import useMessageListener from "@/hooks/use-message-listener";
import { useEffect, useMemo, useRef } from "react";
import TypingIndicator from "../ui/typing-indicator";
import ChatBubble from "../ui/chat-bubble";
import { setAbortController } from "@/features/prompt/promptSlice";
import { updateChat } from "@/features/chats/chatThunk";
import {
  addNewMessage,
  appendMessageContent,
  updateMessage,
} from "@/features/messages/messageThunk";
import { sendPrompt } from "@/services/ai-service";
import useTitleGetter from "@/hooks/use-title-getter";

export function ChatArea({ chatId }: { chatId?: string }) {
  useMessageListener(chatId);
  useTitleGetter(chatId);

  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.messages.messages);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null); // Ref for the chat container

  const latestUserMessage = useMemo(
    () =>
      messages
        .slice()
        .reverse()
        .find((msg) => msg.role === "user"),
    [messages]
  );

  useEffect(() => {
    if (
      latestUserMessage &&
      chatContainerRef.current &&
      messagesEndRef.current
    ) {
      messagesEndRef.current.style.height = "200px";

      const userMessageElement = document.getElementById(
        `message-${latestUserMessage.id}`
      );

      if (userMessageElement) {
        const container = chatContainerRef.current;
        const elementTop = userMessageElement.offsetTop;
        container.scrollTo({
          top: elementTop,
          behavior: "smooth",
        });
      }
    }
  }, [latestUserMessage?.id]);

  const handleEditMessage = async (messageId: string, content: string) => {
    if (!chatId) return;

    await dispatch(
      updateMessage({
        messageId: messageId,
        data: {
          text: content,
          status: "done",
        },
      })
    );

    const editedMessage = messages.find((msg) => msg.id === messageId);
    if (!editedMessage) return;

    const messagesToDelete = messages.filter(
      (msg) =>
        msg.created_at > editedMessage.created_at && msg.status !== "deleted"
    );

    for (const msg of messagesToDelete) {
      await dispatch(
        updateMessage({
          messageId: msg.id,
          data: {
            status: "deleted",
          },
        })
      );
    }

    const responseId = await dispatch(
      addNewMessage({
        chatId: chatId,
        role: "ai",
        text: "",
        status: "typing",
      })
    ).then((action) => action.payload as string);

    const chatHistory: ChatHistory[] = [
      ...messages.filter((message) => message.status != "deleted"),
      { role: "user", text: content, attachments: editedMessage.attachments },
    ];

    const controller = new AbortController();
    dispatch(setAbortController(controller));

    await sendPrompt({
      chatHistory,
      onMessage: async (msg) => {
        await dispatch(
          appendMessageContent({
            messageId: responseId,
            content: msg,
          })
        );
      },
      onStart: async () => {
        await dispatch(
          updateMessage({
            messageId: responseId,
            data: {
              status: "pending",
            },
          })
        );

        await dispatch(
          updateChat({
            chatId: chatId,
            data: {
              status: "pending",
            },
          })
        );
      },
      onEnd: async () => {
        await dispatch(
          updateMessage({
            messageId: responseId,
            data: {
              status: "done",
            },
          })
        );

        await dispatch(
          updateChat({
            chatId: chatId,
            data: {
              last_message_at: new Date().getTime(),
              status: "done",
            },
          })
        );

        dispatch(setAbortController(null));
      },
      onError: async (error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          console.log("ABORTED");
          console.log(error);

          await dispatch(
            updateChat({
              chatId: chatId,
              data: {
                last_message_at: new Date().getTime(),
                status: "done",
              },
            })
          );
        } else {
          await dispatch(
            updateMessage({
              messageId: chatId,
              data: {
                status: "failed",
              },
            })
          );

          await dispatch(
            updateChat({
              chatId: chatId,
              data: {
                last_message_at: new Date().getTime(),
                status: "failed",
              },
            })
          );
        }

        dispatch(setAbortController(null));

        // if (error instanceof Error) {
        //   dispatch(setError(error.message));
        // } else {
        //   dispatch(setError("Some Error occured"));
        // }
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto relative" ref={chatContainerRef}>
      <div className="max-w-3xl mx-auto px-4">
        {messages
          .filter((msg) => msg.status != "deleted")
          .map((message) => {
            // Don't pre-create the component and reuse it
            if (message.status === "typing") {
              return <TypingIndicator key={message.id} id={message.id} />;
            } else if (
              message.status === "pending" ||
              message.status === "done"
            ) {
              return (
                <ChatBubble
                  key={message.id}
                  id={message.id}
                  content={message.text}
                  attachments={message.attachments}
                  sender={message.role}
                  onEdit={handleEditMessage}
                />
              );
            } else if (message.status === "failed") {
              return <p key={message.id}>Some error occurred</p>;
            }
            return null; // Handle any other status
          })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
