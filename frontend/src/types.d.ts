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

interface User {
  _id: string;
  email: string;
  role: "user";
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
  profilePicture: string | null;
}
