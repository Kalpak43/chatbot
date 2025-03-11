import { Route, Routes } from "react-router";
import "./App.css";
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/chat/:chatId" element={<Chatpage />} />
    </Routes>
  );
}

export default App;
