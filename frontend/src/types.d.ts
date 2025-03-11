interface MessageType {
  role: "user" | "ai";
  text: string;
  file?: File;
}
