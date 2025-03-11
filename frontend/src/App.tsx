import { Route, Routes } from "react-router";
import "./App.css";
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";
import Layout from "./Layout";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/chat/:chatId" element={<Chatpage />} />
      </Route>
    </Routes>
  );
}

export default App;
