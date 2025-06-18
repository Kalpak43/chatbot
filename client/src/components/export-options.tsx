import { Download } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import { useSidebar } from "./ui/sidebar";
import { useAppSelector } from "@/app/hooks";
import db from "@/dexie";

function ExportOptions() {
  const { state } = useSidebar();

  if (state == "expanded") return null;

  const messages = useAppSelector((state) => state.messages.messages);

  const processMessages = async () => {
    if (!messages || messages.length == 0) return [];

    const messagesList = await Promise.all(
      messages.map((msg) => db.messages.get(msg.id))
    );

    return messagesList.map((msg) => ({
      role: msg?.role ?? "user",
      text: msg?.text ?? "",
    }));
  };

  const formatMarkdown = (
    messagesList: {
      role: "user" | "ai";
      text: string;
    }[]
  ) => {
    return messagesList
      .map((msg) => {
        if (msg.role === "user") return `## **User:** ${msg.text}`;
        if (msg.role === "ai") return `**Assistant:** ${msg.text}`;
        return msg.text; // fallback
      })
      .join("\n\n---\n\n");
  };

  const handleMd = async () => {
    const messageList = await processMessages();
    if (messageList.length == 0) return;

    const markdownContent = formatMarkdown(messageList);

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-history.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="[&_svg:not([class*='size-'])]:size-6 size-10"
        >
          <Download />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleMd}>Export as .md</DropdownMenuItem>
          <DropdownMenuItem>Export as .docx</DropdownMenuItem>
          <DropdownMenuItem>Export as .pdf</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportOptions;
