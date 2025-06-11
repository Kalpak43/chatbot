type Status = "done" | "pending" | "failed" | "typing" | "deleted";

interface Attachment {
  url: string;
  type: "image" | "file";
}

interface MessageType {
  id: string;
  role: "user" | "ai";
  text: string;
  attachments: Attachment[];
  chatId: string;
  status: Status;
  created_at: number;
  updated_at: number;
  syncStatus: SyncStatus;
}

interface ChatType {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  last_message_at: number;
  status: Status;
  lastSynced: number | null;
  syncStatus: SyncStatus;
}

interface ChatHistory {
  role: "user" | "ai";
  text: string;
  attachments: Attachment[];
}
