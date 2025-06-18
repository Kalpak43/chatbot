import { List, X } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { useEffect, useState } from "react";
import db from "@/dexie";

function ConversationTree() {
  const messages = useAppSelector((state) => state.messages.messages);

  return (
    <>
      {messages.length > 0 && <ConversationTreeTrigger />}

      <Sidebar variant="floating" side="right">
        <SidebarHeader className="font-newsreader font-[600] text-secondary text-lg">
          Conversation Tree
        </SidebarHeader>
        <SidebarTrigger
          size={"sm"}
          className="[&_svg:not([class*='size-'])]:size-4 size-6 absolute top-0 right-0 m-1"
        >
          <X />
        </SidebarTrigger>
        {/* <SidebarSeparator /> */}
        <SidebarContent className="px-2">
          <SidebarGroup>
            <div>
              <ul className="list-disc list-outside text-sm ml-4 space-y-4">
                {messages
                  .filter((msg) => msg.role == "user")
                  .map((msg) => (
                    <ConversationLink key={msg.id} {...msg} />
                  ))}
              </ul>
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}

export default ConversationTree;

function ConversationTreeTrigger() {
  const { state } = useSidebar();
  if (state == "expanded") return null;

  return (
    <SidebarTrigger
      size={"lg"}
      className="[&_svg:not([class*='size-'])]:size-6 size-10"
    >
      <List />
    </SidebarTrigger>
  );
}

function ConversationLink({
  id,
}: {
  id: string;
  chatId: string;
  created_at: number;
  status: Status;
  role: "user" | "ai";
}) {
  const [message, setMessage] = useState(id);

  useEffect(() => {
    db.messages.get(id).then((message) => setMessage(message?.text ?? id));
  }, [id]);

  const handleScroll = () => {
    const element = document.getElementById(`message-${id}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth", // Optional: for a smooth scrolling effect
        block: "start", // Scrolls to the top of the element
      });
    }
  };

  return (
    <li className="">
      <button
        onClick={handleScroll}
        className="inline-flex text-left cursor-pointer hover:text-primary"
      >
        <span className="line-clamp-1">{message}</span>
      </button>
    </li>
  );
}
