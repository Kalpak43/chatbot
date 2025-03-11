interface MessageType {
  role: "user" | "ai";
  text: string;
  file?: File;
}

interface ChatType {
  id: string;
  messages: MessageType[];
  created_at: Date;
}
