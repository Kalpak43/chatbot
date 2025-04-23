import { Route, Routes } from "react-router";
import "./App.css";
import Layout from "./Layout";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { checkLogin } from "./features/auth/authThunk";
import { useToast } from "./hooks/useToast";
import { lazy, Suspense } from "react";
import { useLastSynced } from "./hooks/useLastSynced";
import { useLiveQuery } from "dexie-react-hooks";
import db from "./db";
import { sync } from "./utils";

// const Homepage = lazy(() => import("./pages/Homepage"));
const Chatpage = lazy(() => import("./pages/Chatpage"));
const Loginpage = lazy(() => import("./pages/Loginpage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));

function App() {
  const { user, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const [lastSynced, setLastSynced] = useLastSynced();

  const isSyncing = useRef(false);

  const newChats = useLiveQuery(
    () => db.chats.where("updated_at").above(lastSynced).toArray(),
    [lastSynced]
  );
  const newMessages = useLiveQuery(
    () => db.messages.where("updated_at").above(lastSynced).toArray(),
    [lastSynced]
  );

  useEffect(() => {
    if (newChats && newMessages) {
      if (newChats.length === 0 && newMessages.length === 0) return;

      const hasPendingOrTyping = newMessages.some(
        (message) => message.status === "pending" || message.status === "typing"
      );

      if (!hasPendingOrTyping) {
        isSyncing.current = true;
        const now = new Date().getTime();
        console.log("SYNCING>>>>");
        console.log("C >>>> ", newChats);
        console.log("M >>>> ", newMessages);
        sync(newChats, newMessages)
          .then(() => setLastSynced(now))
          .finally(() => {
            isSyncing.current = false;
          });
      }
    }
  }, [newChats, newMessages]);

  useEffect(() => {
    dispatch(checkLogin());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      showToast("Signed in successfully", "success");
    }
  }, [user]);

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Chatpage />} />
          <Route path="/chat/:chatId?" element={<Chatpage />} />
        </Route>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
