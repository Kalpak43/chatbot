import db from "@/dexie";
import { deleteChat, getChats } from "@/features/chats/chatThunk";
import { getMessages } from "@/features/messages/messageThunk";
import { SyncStatus } from "@/services/sync-service";
import { Middleware, PayloadAction } from "@reduxjs/toolkit";

export const deleteChatMiddleware: Middleware =
  (store) => (next) => async (action) => {
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

        // deletedMessages.forEach((msg) => {
        //   syncService.syncMessage(msg.id);
        // });

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
  (store) => (next) => async (action: any) => {
    const result = next(action);

    if (action.type.endsWith("/fulfilled")) {
      const isChatAction = action.type.startsWith("chat/");
      const isMessageAction = action.type.startsWith("messages/");

      // Exclude get operations
      const isGetChats = getChats.fulfilled.match(action);
      const isGetMessages = getMessages.fulfilled.match(action);
      console.log("TYPE: ", action.type);

      if ((isChatAction || isMessageAction) && !isGetChats && !isGetMessages) {
        console.log(
          "SYNCING",
          isChatAction,
          isMessageAction,
          isGetChats,
          isGetMessages
        );
      }
    }

    return result;
  };
