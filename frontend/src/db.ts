import Dexie, { Table } from "dexie";

class ChatDatabase extends Dexie {
  chats!: Table<ChatType, string>;
  messages!: Table<MessageType, string>;

  constructor() {
    super("ChatDatabase");
    this.version(1).stores({
      chats: "id, title, created_at, last_message_at, status, updated_at", // Index `id` as primary key and index other fields as needed
      messages: "id, chatId, role, created_at, updated_at, status",
    });
  }
}

const db = new ChatDatabase();

db.chats.hook("creating", (_, obj: ChatType) => {
  obj.created_at = new Date().getTime();
  obj.updated_at = obj.created_at;

  // console.log("HERE: ", obj);
});

db.chats.hook("updating", (mods: Partial<ChatType>, primKey, obj: ChatType) => {
  mods.updated_at = new Date().getTime();
});

db.messages.hook("creating", (primKey, obj: MessageType) => {
  obj.created_at = new Date().getTime();
  obj.updated_at = obj.created_at;
});

db.messages.hook("updating", (mods: Partial<MessageType>, primKey, obj) => {
  mods.updated_at = new Date().getTime();
});

export default db;
