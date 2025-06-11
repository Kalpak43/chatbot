import { createAsyncThunk } from "@reduxjs/toolkit";
import db from "@/dexie";
import { syncService, SyncStatus } from "../../services/sync-service";

// chats
export const createNewChat = createAsyncThunk("chats/create", async () => {
  const now = new Date().getTime();
  const id = crypto.randomUUID();

  const newChat: ChatType = {
    id: id,
    title: "",
    created_at: now,
    updated_at: now,
    last_message_at: now,
    status: "done",
    lastSynced: null,
    syncStatus: SyncStatus.PENDING,
  };
  await db.chats.add(newChat);

  // syncService.syncChat(id);

  return newChat;
});

export const getChats = createAsyncThunk("chats/get", async () => {
  return (await db.chats.toArray())
    .filter((chat) => chat.status != "deleted")
    .sort((a, b) => b.last_message_at - a.last_message_at);
});

// export const getChat = createAsyncThunk(
//   "chat/getChat",
//   async (chatId: string) => {
//     const chat = await db.chats.get(chatId);
//     if (!chat) throw new Error("Chat not found");
//     return chat;
//   }
// );

export const updateChat = createAsyncThunk(
  "chat/update",
  async ({
    chatId,
    data,
  }: {
    chatId: string;
    data: Partial<Omit<ChatType, "id">>;
  }) => {
    await db.chats.update(chatId, {
      ...data,
      updated_at: new Date().getTime(),
      syncStatus: SyncStatus.PENDING,
    });

    // syncService.syncChat(chatId);
    return { chatId, data };
  }
);

export const deleteChat = createAsyncThunk(
  "chat/delete",
  async ({ chatId }: { chatId: string }) => {
    await db.chats.update(chatId, {
      status: "deleted",
      updated_at: new Date().getTime(),
      syncStatus: SyncStatus.PENDING,
    });

    // syncService.syncChat(chatId);
    return { chatId };
  }
);

// misc
export const deleteChatAndMessages = createAsyncThunk(
  "chat/deleteChatAndMessages",
  async ({ chatId }: { chatId: string }) => {
    await db.transaction("rw", db.chats, db.messages, async () => {
      // Soft delete all messages related to the chat
      await db.messages
        .where("chatId")
        .equals(chatId)
        .modify((message) => {
          message.status = "deleted";
          message.updated_at = Date.now();
          message.syncStatus = SyncStatus.PENDING;
        });

      // Soft delete the chat itself
      await db.chats.update(chatId, {
        status: "deleted",
        updated_at: Date.now(),
        syncStatus: SyncStatus.PENDING,
      });
    });

    const messages = await db.messages.where("chatId").equals(chatId).toArray();
    messages.forEach((msg) => {
      syncService.syncMessage(msg.id);
    });

    syncService.syncChat(chatId);

    return chatId;
  }
);

// sync
export const syncLocalChanges = createAsyncThunk(
  "chat/syncLocalChanges",
  async () => {
    await syncService.syncAll();
    return true;
  }
);

export const pullRemoteChanges = createAsyncThunk(
  "chat/pullRemoteChanges",
  async ({ lastSyncTimestamp }: { lastSyncTimestamp: number }, thunkAPI) => {
    const result = await syncService.pullChanges(lastSyncTimestamp);

    if (!result) {
      return thunkAPI.rejectWithValue("Failed to pull remote changes");
    }

    if (result.success) {
      // Reload chats and messages after sync
      const updatedChats = (await db.chats.toArray()).filter(
        (chat) => chat.status != "deleted"
      );
      const updatedMessages = await db.messages.toArray();
      return {
        chats: updatedChats,
        messages: updatedMessages,
        syncTimestamp: result.syncTimestamp,
      };
    }

    return thunkAPI.rejectWithValue("Failed to pull remote changes");
  }
);
