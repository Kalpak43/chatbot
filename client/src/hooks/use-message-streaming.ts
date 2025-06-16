import { streamingManager } from "@/services/stream-manager-service";
import { useCallback, useState } from "react";

export function useMessageStreaming(messageId: string) {
  const [streamingData, setStreamingData] = useState<{
    content: string;
    isStreaming: boolean;
  } | null>(null);

  useState(() => {
    const unsubscribe = streamingManager.subscribe(messageId, setStreamingData);
    return unsubscribe;
  });

  const updateContent = useCallback(
    (content: string) => {
      streamingManager.updateContent(messageId, content);
    },
    [messageId]
  );

  const setStreamingStatus = useCallback(
    (isStreaming: boolean) => {
      streamingManager.setStreamingStatus(messageId, isStreaming);
    },
    [messageId]
  );

  const clearMessage = useCallback(() => {
    streamingManager.clearMessage(messageId);
  }, [messageId]);

  return {
    streamingData,
    updateContent,
    setStreamingStatus,
    clearMessage,
  };
}
