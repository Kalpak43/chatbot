import { Route, Routes } from "react-router";
import "./App.css";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/chat/:chatId" element={<Homepage />} />
    </Routes>
  );
}

export default App;
