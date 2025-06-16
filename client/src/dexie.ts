import Dexie, { Table } from "dexie";

class ChatDatabase extends Dexie {
  chats!: Table<ChatType, string>;
  messages!: Table<MessageType, string>;

  constructor() {
    super("ChatDatabase");
    this.version(2).stores({
      chats:
        "id, title, created_at, last_message_at, status, updated_at, syncStatus",
      messages: "id, [chatId+id], chatId, role, created_at, updated_at, status, syncStatus",
    });
  }
}

const db = new ChatDatabase();

export default db;
