import { createAsyncThunk } from "@reduxjs/toolkit";
import db from "../../db";

// chats
export const createNewChat = createAsyncThunk(
  "chat/createNewChat",
  async () => {
    const id = crypto.randomUUID();
    const newChat: ChatType = {
      id: id,
      title: "",
      created_at: new Date().getTime(),
      last_message_at: new Date().getTime(),
      status: "done",
      lastSynced: null,
    };
    await db.chats.add(newChat);
    return newChat;
  }
);

export const updateChatStatus = createAsyncThunk(
  "chat/updateChatStatus",
  async ({ chatId, status }: { chatId: string; status: Status }) => {
    await db.chats.update(chatId, { status });

    return { chatId, status };
  }
);

export const updateChatTitle = createAsyncThunk(
  "chat/updateChatTitle",
  async ({ chatId, title }: { chatId: string; title: string }) => {
    console.log(title);
    await db.chats.update(chatId, { title });

    return { chatId, title };
  }
);

export const getChats = createAsyncThunk("chat/getChats", async () => {
  return (await db.chats.toArray()).sort(
    (a, b) => b.last_message_at - a.last_message_at
  );
});

export const getChat = createAsyncThunk(
  "chat/getChat",
  async ({ id }: { id: string }, thunkAPI) => {
    const chat = await db.chats.get(id);

    if (!chat) {
      return thunkAPI.rejectWithValue("Chat not Found!!!");
    }

    return chat;
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
  }: {
    chatId: string;
    role: "user" | "ai";
    text: string;
    status: Status;
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
    });
    await db.chats.update(chatId, { last_message_at: new Date().getTime() });

    return id;
  }
);

export const updateMessageStatus = createAsyncThunk(
  "chat/updateMessageStatus",
  async ({ messageId, status }: { messageId: string; status: Status }) => {
    await db.messages.update(messageId, { status });
  }
);

export const updateMessageContent = createAsyncThunk(
  "chat/updateMessageContent",
  async ({
    chatId,
    message,
    updatedContent,
  }: {
    chatId: string;
    message: MessageType;
    updatedContent: string;
  }) => {
    await db.transaction("rw", db.messages, async () => {
      // Delete messages with a later `created_at` timestamp in the same chat
      await db.messages
        .where("chatId")
        .equals(chatId)
        .and((msg) => msg.created_at > message.created_at)
        .delete();
    });
    await db.messages.update(message.id, { text: updatedContent });
  }
);

export const appendMessageContent = createAsyncThunk(
  "chat/appendMessageContent",
  async ({ messageId, text }: { messageId: string; text: string }) => {
    const message = await db.messages.get(messageId);
    if (!message) return;
    await db.messages.update(messageId, { text: message.text + text });
  }
);

export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async ({ chatId, message }: { chatId: string; message: MessageType }) => {
    await db.transaction("rw", db.messages, async () => {
      // Delete messages with a later `created_at` timestamp in the same chat
      await db.messages
        .where("chatId")
        .equals(chatId)
        .and((msg) => msg.created_at >= message.created_at)
        .modify((message) => {
          message.status = "deleted";
        });
    });
  }
);

export const deleteChatAndMessages = createAsyncThunk(
  "chat/deleteChatAndMessages",
  async ({ chatId }: { chatId: string }) => {
    await db.transaction("rw", db.chats, db.messages, async () => {
      // Delete all messages related to the chat
      await db.messages.where("chatId").equals(chatId).delete();

      // Delete the chat itself
      await db.chats.delete(chatId);
    });

    return chatId;
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

export const updateChat = createAsyncThunk(
  "chat/updateChat",
  async ({
    chatId,
    data,
  }: {
    chatId: string;
    data: Partial<Omit<ChatType, "id">>;
  }) => {
    await db.chats.update(chatId, data);
    return { chatId, ...data };
  }
);
