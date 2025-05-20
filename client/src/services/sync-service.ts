import axios from "axios";
import db from "@/dexie";
import { auth } from "@/firebase";

export enum SyncStatus {
  DONE = "done",
  PENDING = "pending",
  FAILED = "failed",
}

const API_URL = import.meta.env.VITE_API_URL;

export class SyncService {
  // Queue to handle sync operations
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing = false;

  // Process the sync queue one by one
  private async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;

    try {
      const syncOperation = this.syncQueue.shift();
      if (syncOperation) {
        await syncOperation();
      }
    } catch (error) {
      console.error("Sync operation failed:", error);
    } finally {
      this.isSyncing = false;
      // Continue processing if there are more items
      if (this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }
  }

  // Add sync operation to queue
  private queueSync(operation: () => Promise<void>) {
    this.syncQueue.push(operation);
    this.processSyncQueue();
  }

  // Sync a specific chat with the server
  async syncChat(chatId: string) {
    const chat = await db.chats.get(chatId);
    if (!chat) return;

    if (chat.syncStatus == SyncStatus.DONE) return;

    this.queueSync(async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        console.log("SEND CHAT TO SERVER");

        const response = await axios.post(
          `${API_URL}/api/chat/sync-chat`,
          {
            chat,
            // user,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to sync chat");
        }

        const currentTime = Date.now();

        // Update local status
        await db.chats.update(chatId, {
          syncStatus: SyncStatus.DONE,
          updated_at: currentTime,
          lastSynced: currentTime,
        });
      } catch (error) {
        console.error("Chat sync failed:", error);
        await db.chats.update(chatId, { syncStatus: SyncStatus.FAILED });
      }
    });
  }

  async syncMessage(messageId: string) {
    const message = await db.messages.get(messageId);
    if (!message) return;

    if (
      message.syncStatus == SyncStatus.DONE ||
      message.status == "typing" ||
      message.status == "pending"
    )
      return;

    this.queueSync(async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        console.log("SEND MESSAGE TO SERVER");

        const response = await axios.post(
          `${API_URL}/api/chat/sync-message`,
          {
            message,
            // user,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to sync chat");
        }

        const currentTime = Date.now();

        // Update local status
        await db.messages.update(message.id, {
          syncStatus: SyncStatus.DONE,
          updated_at: currentTime,
        });
      } catch (error) {
        console.error("Chat sync failed:", error);
        await db.messages.update(messageId, { syncStatus: SyncStatus.FAILED });
      }
    });
  }

  // Sync all pending chats and messages
  async syncAll() {
    // Get all pending chats
    const pendingChats = await db.chats
      .where("syncStatus")
      .anyOf([SyncStatus.PENDING, SyncStatus.FAILED])
      .toArray();

    const pendingMessages = await db.messages
      .where("syncStatus")
      .anyOf([SyncStatus.PENDING, SyncStatus.FAILED])
      .toArray();

    // Queue sync operations
    pendingChats.forEach((chat) => this.syncChat(chat.id));

    pendingMessages
      .filter(
        (message) => message.status != "pending" && message.status != "typing"
      )
      .forEach((message) => this.syncMessage(message.id));
  }

  // Pull changes from server
  async pullChanges(lastSyncTimestamp: number) {
    // console.log(lastSyncTimestamp);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      console.log("TOKEN: ",idToken)

      const chatResponse = await axios.get(
        `${API_URL}/api/chat/get-chats?since=${lastSyncTimestamp}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const { chats: fetchedChats } = chatResponse.data;
      // console.log(fetchedChats);

      const messageResponse = await axios.get(
        `${API_URL}/api/chat/get-messages?since=${lastSyncTimestamp}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const { messages: fetchedMessages } = messageResponse.data;

      const currentTime = Date.now();

      // Update local database with server changes
      await db.transaction("rw", db.chats, db.messages, async () => {
        for (const chat of fetchedChats) {
          const existingChat = await db.chats.get(chat.id);

          if (!existingChat || existingChat.updated_at < chat.updated_at) {
            await db.chats.put({
              ...chat,
              syncStatus: SyncStatus.DONE,
              lastSynced: currentTime,
            });
          }
        }

        for (const message of fetchedMessages) {
          const existingMessage = await db.messages.get(message.id);

          if (
            !existingMessage ||
            existingMessage.updated_at < message.updated_at
          ) {
            await db.messages.put({
              ...message,
              syncStatus: SyncStatus.DONE,
            });
          }
        }
      });

      return {
        success: true,
        syncTimestamp: currentTime,
      };
    } catch (error) {
      console.error("Pull changes failed:", error);
      return {
        success: false,
        error,
      };
    }
  }
}

export const syncService = new SyncService();
