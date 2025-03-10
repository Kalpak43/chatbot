import { useEffect } from "react";
import "./App.css";
import { sendPrompt } from "./utils";
import ChatComponent from "./components/ChatComponent";

function App() {
  return (
    <main>
      <ChatComponent />
    </main>
  );
}

export default App;
