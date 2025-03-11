import { useAppSelector } from "../app/hooks";

function Sidebar() {
  const { chats } = useAppSelector((state) => state.chat);

  return (
    <div>
      {chats.map((chat) => {
        return <div>{chat.id}</div>;
      })}
    </div>
  );
}

export default Sidebar;
