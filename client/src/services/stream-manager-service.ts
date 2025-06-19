class StreamingManager {
  private streamingData: Map<
    string,
    { content: string; isStreaming: boolean }
  > = new Map();

  private listeners: Map<
    string,
    Set<(data: { content: string; isStreaming: boolean }) => void>
  > = new Map();

  updateContent(messageId: string, content: string) {
    // const current = this.streamingData.get(messageId) || {
    //   content: "",
    //   isStreaming: false,
    // };
    const updated = { content, isStreaming: true };
    this.streamingData.set(messageId, updated);

    // Notify only listeners for this specific message
    const messageListeners = this.listeners.get(messageId);
    if (messageListeners) {
      messageListeners.forEach((listener) => listener(updated));
    }
  }

  setStreamingStatus(messageId: string, isStreaming: boolean) {
    const current = this.streamingData.get(messageId) || {
      content: "",
      isStreaming: false,
    };

    const updated = { ...current, isStreaming };
    this.streamingData.set(messageId, updated);

    const messageListeners = this.listeners.get(messageId);
    if (messageListeners) {
      messageListeners.forEach((listener) => listener(updated));
    }
  }

  subscribe(
    messageId: string,
    listener: (data: { content: string; isStreaming: boolean }) => void
  ) {
    if (!this.listeners.has(messageId)) {
      this.listeners.set(messageId, new Set());
    }
    this.listeners.get(messageId)!.add(listener);

    // Return current data immediately
    const current = this.streamingData.get(messageId);
    if (current) {
      listener(current);
    }

    // Return unsubscribe function
    return () => {
      const messageListeners = this.listeners.get(messageId);
      if (messageListeners) {
        messageListeners.delete(listener);
        if (messageListeners.size === 0) {
          this.listeners.delete(messageId);
        }
      }
    };
  }

  clearMessage(messageId: string) {
    this.streamingData.delete(messageId);
    this.listeners.delete(messageId);
  }

  getStreamingData(messageId: string) {
    return this.streamingData.get(messageId);
  }
}

export const streamingManager = new StreamingManager();

export const updateStreamingContent = (messageId: string, content: string) => {
  streamingManager.updateContent(messageId, content);
};

export const setStreamingStatus = (messageId: string, isStreaming: boolean) => {
  streamingManager.setStreamingStatus(messageId, isStreaming);
};

export const clearStreamingMessage = (messageId: string) => {
  streamingManager.clearMessage(messageId);
};
