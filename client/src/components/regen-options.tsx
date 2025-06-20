import { Button } from "./ui/button";
import { RefreshCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { modelList } from "@/static/models";
import { useAppDispatch } from "@/app/hooks";
import {
  addNewMessage,
  deleteMessage,
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

function RegenOptions({
  messageId,
  chatId,
}: {
  messageId: string;
  chatId: string;
}) {
  const dispatch = useAppDispatch();

  const regenerateResponse = async (model: string) => {
    if (!chatId) return;

    console.log(model);

    await dispatch(
      deleteMessage({
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
      webSearch: false,
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} size={"icon"} className="&_svg:size-6">
          <RefreshCcw />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          Try again with:{" "}
        </DropdownMenuLabel>
        {modelList.map((model) => (
          <DropdownMenuItem
            key={model.value}
            className="text-gray-800 dark:text-gray-400 dark:hover:text-accent-foreground text-xs"
            onClick={() => regenerateResponse(model.value)}
          >
            {model.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default RegenOptions;
