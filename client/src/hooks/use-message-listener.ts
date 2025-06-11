import { useAppDispatch } from "@/app/hooks";
import db from "@/dexie";
import { setMessages } from "@/features/messages/messageSlice";
import { liveQuery } from "dexie";
import { useEffect } from "react";

function useMessageListener(chatId?: string) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!chatId) {
      dispatch(setMessages([]));
    }

    const subscription = liveQuery(async () =>
      db.messages.where({ chatId }).toArray()
    ).subscribe({
      next: (messages) => {
        // Dispatch messages to Redux store
        dispatch(
          setMessages([...messages].sort((a, b) => a.created_at - b.created_at))
        );
      },
      error: (error) => {
        console.error("Error fetching messages:", error);
      },
    });

    return () => {
      subscription.unsubscribe(); // Clean up subscription on unmount
    };
  }, [chatId]);

  return {};
}

export default useMessageListener;
