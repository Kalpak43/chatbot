type Status = "done" | "pending" | "failed" | "typing" | "deleted";

interface MessageType {
  id: string;
  role: "user" | "ai";
  text: string;
  chatId: string;
  status: Status;
  created_at: number;
  updated_at: number;
}

interface ChatType {
  id: string;
  title: string;
  created_at: number;
  last_message_at: number;
  status: Status;
  lastSynced: number | null;
}

interface User {
  _id: string;
  email: string;
  role: "user";
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
  profilePicture: string | null;
}
