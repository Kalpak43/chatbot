import db from "@/dexie";
import { deleteChat } from "@/features/chats/chatThunk";
import { syncService, SyncStatus } from "@/services/sync-service";
import { Middleware } from "@reduxjs/toolkit";

export const deleteChatMiddleware: Middleware =
  (_) => (next) => async (action) => {
    const result = next(action);

    if (deleteChat.fulfilled.match(action)) {
      const { chatId } = action.payload;

      try {
        await db.messages
          .where("chatId")
          .equals(chatId)
          .modify((message) => {
            message.status = "deleted";
            message.updated_at = Date.now();
            message.syncStatus = SyncStatus.PENDING;
          });

        const deletedMessages = await db.messages
          .where("chatId")
          .equals(chatId)
          .filter((msg) => msg.status === "deleted")
          .toArray();

        deletedMessages.forEach((msg) => {
          syncService.syncMessage(msg.id);
          console.log("SYNCING", action.type);
        });

        console.log(
          `Deleted ${deletedMessages.length} messages for chat ${chatId}`
        );
      } catch (error) {
        console.error("Error deleting messages for chat:", error);
      }
    }

    return result;
  };

export const syncMiddleware: Middleware =
  (_) => (next) => async (action: any) => {
    const result = next(action);

    const allowedActions = [
      "chat/update/fulfilled",
      "chat/delete/fulfilled",
      "messages/update/fulfilled",
    ];

    if (allowedActions.includes(action.type)) {
      if (action.type.startsWith("chat/")) {
        syncService.syncChat(action.payload.chatId);
      }

      if (action.type.startsWith("messages/")) {
        syncService.syncMessage(action.payload.messageId);
      }
    }

    return result;
  };
