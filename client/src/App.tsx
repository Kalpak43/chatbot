import { Suspense, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./Layout";
import Chatpage from "./pages/Chatpage";
import Loginpage from "./pages/Loginpage";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { toast } from "sonner";
import { checkLogin } from "./features/auth/authThunk";
import Signuppage from "./pages/Signuppage";
import { getChats } from "./features/chats/chatThunk";
import { useSync } from "./hooks/use-sync";

function App() {
  const dispatch = useAppDispatch();

  const error = useAppSelector((state) => state.auth.error);

  useSync();

  // useEffect(() => {
  //   const root = window.document.documentElement;

  //   root.classList.add("dark");
  // }, []);

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(checkLogin());
  }, [dispatch]);

  // useEffect(() => {
  //   if (user) toast.success("Signed in successfully");
  // }, [user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Suspense>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Chatpage />} />
          <Route path="/chat/:chatId?" element={<Chatpage />} />
        </Route>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<Signuppage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
