import db from "@/dexie";
import { SyncStatus } from "@/services/sync-service";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getMessages = createAsyncThunk(
  "messages/get",
  async (chatId: string) => {
    const messages = await db.messages
      .where("chatId")
      .equals(chatId)
      // .filter((message) => message.status != "deleted")
      .toArray();
    return messages;
  }
);

export const addNewMessage = createAsyncThunk(
  "messages/create",
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

    return id;
  }
);

export const updateMessage = createAsyncThunk(
  "messages/update",
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
    // syncService.syncMessage(messageId);

    return { messageId, data };
  }
);

export const appendMessageContent = createAsyncThunk(
  "messages/append",
  async ({ messageId, content }: { messageId: string; content: string }) => {
    const message = await db.messages.get(messageId);
    if (!message) throw new Error("Message not found");

    const updatedContent = message.text + content;
    await db.messages.update(messageId, {
      text: updatedContent,
      updated_at: new Date().getTime(),
      syncStatus: SyncStatus.PENDING,
    });

    // syncService.syncMessage(messageId);

    return { messageId, content: updatedContent };
  }
);
