import { useAppDispatch, useAppSelector } from "@/app/hooks";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { uploadToStorage } from "@/services/upload-service";
import { Card, CardContent } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Globe,
  Mic,
  MicOff,
  Paperclip,
  SendHorizonal,
  StopCircle,
  X,
} from "lucide-react";
import VoiceToText from "../voice-to-text";
import {
  setAbortController,
  setAttachments,
  setModel,
  setPrompt,
  toggleWebSearch,
  updateLimit,
} from "@/features/prompt/promptSlice";
import { createNewChat, updateChat } from "@/features/chats/chatThunk";
import { addNewMessage, updateMessage } from "@/features/messages/messageThunk";
import { useNavigate } from "react-router";
import { sendPrompt } from "@/services/ai-service";
import { cn, createHistory } from "@/lib/utils";
import { syncService } from "@/services/sync-service";
import {
  clearStreamingMessage,
  setStreamingStatus,
  updateStreamingContent,
} from "@/services/stream-manager-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { modelList } from "@/static/models";

export function ChatInput({ chatId }: { chatId?: string }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messages = useAppSelector((state) => state.messages.messages);

  const user = useAppSelector((state) => state.auth.user);

  const prompt = useAppSelector((state) => state.prompt.prompt);
  const attachments = useAppSelector((state) => state.prompt.attachments);
  const model = useAppSelector((state) => state.prompt.model);
  const webSearch = useAppSelector((state) => state.prompt.webSearch);
  const abortController = useAppSelector(
    (state) => state.prompt.abortController
  );

  const isStreaming = useMemo(() => !!abortController, [abortController]);

  const [isListening, setIsListening] = useState(false);

  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const el = inputRef.current;

    const handleFocus = () => {
      setTimeout(() => {
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300); // allow time for keyboard to appear
    };

    el?.addEventListener("focus", handleFocus);
    return () => {
      el?.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleVoiceText = (text: string) => {
    dispatch(setPrompt(prompt + text));
  };

  const handleUpload = async (file: File) => {
    toast.loading("Uploading your file");

    const url = await uploadToStorage(file);
    if (!url) {
      console.error("Failed to upload file");
      toast.dismiss();
      toast.error("Failed to upload file");
      return;
    }

    const newAttachment: Attachment = {
      url: url,
      type: file.type.startsWith("image") ? "image" : "file",
    };

    dispatch(setAttachments([...attachments, newAttachment]));
    toast.dismiss();
    toast.success("Successfully uploaded the file");
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // setDragCounter((prev) => prev + 1);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      e.currentTarget &&
      !(e.currentTarget as Node).contains(e.relatedTarget as Node | null)
    ) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragOver(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragOver(false);

    if (!user) {
      toast.error("Please log in to upload files");
      return;
    }

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    // Handle multiple files
    for (const file of files) {
      await handleUpload(file);
    }
  };

  const handleSend = useCallback(
    async (message: string, attachments: Attachment[]) => {
      if (!message.trim()) return;

      dispatch(setPrompt(""));
      dispatch(setAttachments([]));

      let id = chatId;

      if (!id) {
        const newChat = await dispatch(createNewChat());

        if (!(newChat.payload as ChatType).id) return;

        id = (newChat.payload as ChatType).id;
      }

      const userMessageId = await dispatch(
        addNewMessage({
          chatId: id,
          role: "user",
          text: message,
          status: "done",
          attachments: attachments,
        })
      ).then((action) => (action.payload as MessageType).id as string);

      syncService.syncMessage(userMessageId);

      if (!chatId) navigate(`/chat/${id}`);

      const chatHistory: ChatHistory[] = await createHistory({
        chatId: id,
        messageId: userMessageId,
      });

      const responseId = await dispatch(
        addNewMessage({
          chatId: id,
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
              chatId: id,
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
              chatId: id,
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
                chatId: id,
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
                chatId: id,
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
        onRateLimitUpdate: (limitInfo) => {
          dispatch(updateLimit({ ...limitInfo }));
        },
        signal: controller.signal,
        id: id,
      });
    },
    [chatId, messages, model, webSearch]
  );

  const handleAbort = () => {
    abortController?.abort();
  };

  return (
    <Card
      className={`w-full max-w-3xl mx-auto sticky bottom-0 xl:mb-2 py-4 px-0 transition-colors duration-200 max-xl:rounded-b-none ${
        isDragOver
          ? "border-2 border-secondary border-dashed bg-blue-50 dark:bg-primary/10"
          : "border border-primary/10"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {attachments.length > 0 && (
        <div className="absolute inset-x-0 bottom-full md:mx-6 bg-card/50 backdrop-blur-md rounded-t-xl -z-1 [box-shadow:0px_-2px_4px_#e3e3e320] p-4 flex items-center gap-2">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className={cn(
                "w-12 aspect-square rounded-md [box-shadow:0px_0px_3px_#e3e3e320]",
                "relative before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-t before:from-black/40 before:to-transparent"
              )}
            >
              <Button
                variant="destructive"
                size={"icon"}
                className={cn(
                  "px-1 py-1 w-fit h-auto text-xs [&_svg:not([class*='size-'])]:size-2 bg-destructive/40",
                  "absolute top-0 right-0 translate-x-1/4 -translate-y-1/4"
                )}
                onClick={() => {
                  dispatch(
                    setAttachments((prev: Attachment[]) =>
                      prev.filter((_, i) => i !== idx)
                    )
                  );
                }}
              >
                <X size={10} />
              </Button>

              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt="attachment"
                  className="object-cover w-full h-full rounded-md"
                />
              ) : (
                <span className="text-xs text-center px-1 h-full flex items-center justify-center">
                  {attachment.url.split(".").pop()?.split("?")[0] || "FILE"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <CardContent className="md:px-4">
        <form
          action=""
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(prompt, attachments);
          }}
        >
          <Textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => dispatch(setPrompt(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(prompt, attachments);
              }
            }}
            rows={5}
            placeholder="Type your message..."
            className="resize-none max-h-[200px]"
          />
          <div className="flex items-center justify-between">
            <div>
              <ModelInput />
            </div>
            <div className="space-x-2">
              <Button
                type="button"
                variant={"outline"}
                size={"icon"}
                className={cn(
                  "relative",
                  webSearch && "bg-accent/80 dark:bg-accent/30"
                )}
                // disabled={!user}
                onClick={() => {
                  dispatch(toggleWebSearch());
                }}
              >
                <Globe />
              </Button>

              <Button
                type="button"
                variant={"outline"}
                size={"icon"}
                className="relative"
                disabled={!user}
              >
                <Paperclip />
                <input
                  type="file"
                  // accept=""
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      handleUpload(file);
                    }
                  }}
                />
              </Button>

              {isStreaming ? (
                <Button
                  variant={"secondary"}
                  type="button"
                  size={"icon"}
                  onClick={handleAbort}
                >
                  <StopCircle />
                </Button>
              ) : isListening ? (
                <VoiceToText
                  isListening={isListening}
                  onListeningChange={setIsListening}
                  onVoice={handleVoiceText}
                >
                  <Button type="button" variant={"outline"} size={"icon"}>
                    <MicOff />
                  </Button>
                </VoiceToText>
              ) : !prompt.trim() ? (
                <VoiceToText
                  isListening={isListening}
                  onListeningChange={setIsListening}
                  onVoice={handleVoiceText}
                >
                  <Button type="button" variant={"outline"} size={"icon"}>
                    <Mic />
                  </Button>
                </VoiceToText>
              ) : (
                <Button size={"icon"}>
                  <SendHorizonal />
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ModelInput() {
  const dispatch = useAppDispatch();
  const model = useAppSelector((state) => state.prompt.model);
  const webSearch = useAppSelector((state) => state.prompt.webSearch);

  useEffect(() => {
    if (webSearch && model.startsWith("sarvam-ai")) {
      dispatch(setModel("gemini-2.5-flash-lite"));
    }
  }, [webSearch]);

  const models = webSearch
    ? modelList.filter((m) => !m.value.startsWith("sarvam-ai"))
    : modelList;

  const handleModelSelect = (model: string) => {
    dispatch(setModel(model));
  };

  const selectedModelTitle =
    models.find((m) => m.value === model)?.title || "Select a model";

  return (
    <div className="w-full max-w-xs">
      <Select value={model} onValueChange={handleModelSelect}>
        <SelectTrigger className="w-full text-xs">
          <SelectValue placeholder="Select a model">
            {selectedModelTitle}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {models.map((modelOption) => (
            <SelectItem key={modelOption.value} value={modelOption.value}>
              {modelOption.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
