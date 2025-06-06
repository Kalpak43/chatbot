import Dexie, { Table } from "dexie";

class ChatDatabase extends Dexie {
  chats!: Table<ChatType, string>;
  messages!: Table<MessageType, string>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      chats:
        "id, title, created_at, last_message_at, status, updated_at, syncStatus", // Index `id` as primary key and index other fields as needed
      messages: "id, chatId, role, created_at, updated_at, status, syncStatus",
    });
  }
}

const db = new ChatDatabase();

export default db;
