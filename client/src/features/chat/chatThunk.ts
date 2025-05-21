import { createAsyncThunk } from "@reduxjs/toolkit";
import db from "@/dexie";
import { syncService, SyncStatus } from "../../services/sync-service";

// chats
export const createNewChat = createAsyncThunk(
  "chat/createNewChat",
  async () => {
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

    syncService.syncChat(id);

    return newChat;
  }
);

export const getChats = createAsyncThunk("chat/getChats", async () => {
  return (await db.chats.toArray())
    .filter((chat) => chat.status != "deleted")
    .sort((a, b) => b.last_message_at - a.last_message_at);
});

export const getChat = createAsyncThunk(
  "chat/getChat",
  async (chatId: string) => {
    const chat = await db.chats.get(chatId);
    if (!chat) throw new Error("Chat not found");
    return chat;
  }
);

export const updateChat = createAsyncThunk(
  "chat/updateChat",
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

    syncService.syncChat(chatId);
    return { chatId, data };
  }
);

// messages
export const addNewMessage = createAsyncThunk(
  "chat/addNewMessage",
  async ({
    chatId,
    role,
    text,
    status,
    attachments,
  }: {
    chatId: string;
    role: "user" | "ai";
    text: string;
    status: Status;
    attachments?: Attachment[];
  }) => {
    const id = crypto.randomUUID();
    await db.messages.add({
      id: id,
      chatId: chatId,
      role: role,
      text: text,
      status: status,
      created_at: new Date().getTime(),
      updated_at: new Date().getTime(),
      syncStatus: SyncStatus.PENDING,
      attachments: attachments || [],
    });
    await db.chats.update(chatId, { last_message_at: new Date().getTime() });

    syncService.syncMessage(id);

    return id;
  }
);

export const updateMessage = createAsyncThunk(
  "chat/updateMessageProperty",
  async ({
    messageId,
    data,
  }: {
    messageId: string;
    data: Partial<Omit<MessageType, "id" | "created_at">>;
  }) => {
    await db.messages.update(messageId, {
      ...data,
      updated_at: new Date().getTime(),
      syncStatus: SyncStatus.PENDING,
    });
    syncService.syncMessage(messageId);

    return { messageId, data };
  }
);

export const appendMessageContent = createAsyncThunk(
  "chat/appendMessageContent",
  async ({ messageId, content }: { messageId: string; content: string }) => {
    const message = await db.messages.get(messageId);
    if (!message) throw new Error("Message not found");

    const updatedContent = message.text + content;
    await db.messages.update(messageId, {
      text: updatedContent,
      updated_at: new Date().getTime(),
      syncStatus: SyncStatus.PENDING,
    });

    syncService.syncMessage(messageId);

    return { messageId, content: updatedContent };
  }
);

export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async (chatId: string) => {
    const messages = await db.messages
      .where("chatId")
      .equals(chatId)
      // .filter((message) => message.status != "deleted")
      .toArray();
    return messages;
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
