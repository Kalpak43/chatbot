interface MessageType {
  role: "user" | "ai";
  text: string;
  file?: File;
}

interface ChatType {
  id: string;
  title: string;
  messages: MessageType[];
  created_at: number;
}
