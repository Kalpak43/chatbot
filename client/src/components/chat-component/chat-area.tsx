import { useAppDispatch, useAppSelector } from "@/app/hooks";
import React, { useEffect, useMemo, useRef } from "react";
import ChatBubble from "../ui/chat-bubble";
import withMessageListener from "@/hocs/withMessageListener";
import useTitleGetter from "@/hooks/use-title-getter";
import {
  addNewMessage,
  deleteMessagesAfter,
  updateMessage,
} from "@/features/messages/messageThunk";
import { createHistory } from "@/lib/utils";
import { setAbortController } from "@/features/prompt/promptSlice";
import { sendPrompt } from "@/services/ai-service";
import {
  clearStreamingMessage,
  setStreamingStatus,
  updateStreamingContent,
} from "@/services/stream-manager-service";
import { updateChat } from "@/features/chats/chatThunk";
import { AnimatePresence, motion } from "motion/react";

const ChatBubbleWithListener = React.memo(withMessageListener(ChatBubble));

export function ChatArea({ chatId }: { chatId?: string }) {
  useTitleGetter(chatId!);

  const dispatch = useAppDispatch();

  const messages = useAppSelector((state) => state.messages.messages);
  const model = useAppSelector((state) => state.prompt.model);
  const webSearch = useAppSelector((state) => state.prompt.webSearch);

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
  }, [latestUserMessage?.id, messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatContainerRef.current && messagesEndRef.current) {
        chatContainerRef.current.scrollTo({
          top: messagesEndRef.current.offsetTop,
          behavior: "smooth",
        });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [chatId]);

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

    await dispatch(
      deleteMessagesAfter({
        chatId,
        messageId,
      })
    );

    const chatHistory: ChatHistory[] = await createHistory({
      chatId: chatId,
      messageId: messageId,
    });

    const responseId = await dispatch(
      addNewMessage({
        chatId: chatId,
        role: "ai",
        text: "",
        status: "typing",
      })
    ).then((action) => (action.payload as MessageType).id as string);

    const controller = new AbortController();
    dispatch(setAbortController(controller));

    let accumulatedContent = "";

    await sendPrompt({
      chatHistory,
      model,
      webSearch,
      onMessage: async (msg) => {
        accumulatedContent += msg;
        updateStreamingContent(responseId, accumulatedContent);
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

        setStreamingStatus(responseId, true);
      },
      onEnd: async () => {
        await dispatch(
          updateMessage({
            messageId: responseId,
            data: {
              text: accumulatedContent,
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

        setStreamingStatus(responseId, false);
        setTimeout(() => clearStreamingMessage(responseId), 100); // Small delay to allow final render
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
              messageId: responseId,
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
      },
      signal: controller.signal,
      id: chatId,
    });
  };

  return (
    <motion.div
      ref={chatContainerRef}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full overflow-y-auto relative"
    >
      <div className="max-w-3xl mx-auto px-4">
        <AnimatePresence initial={false}>
          {messages
            // .filter((msg) => msg.status != "deleted")
            .map((message) => {
              return (
                <ChatBubbleWithListener
                  key={message.id}
                  messageId={message.id}
                  chatId={message.chatId}
                  onEdit={handleEditMessage}
                />
              );
            })}
        </AnimatePresence>
      </div>
      <div id="chat-bottom" ref={messagesEndRef} />
    </motion.div>
  );
}
