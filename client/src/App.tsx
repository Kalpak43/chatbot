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
import { useSync } from "./hooks/useSync";

function App() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const error = useAppSelector((state) => state.auth.error);

  const { syncData, isOnline } = useSync();

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.add("dark");
  }, []);

  useEffect(() => {
    // Initial sync when component mounts
    if (isOnline) {
      syncData();
    }

    // Set up periodic sync every 5 minutes when online
    const intervalId = setInterval(() => {
      if (isOnline) {
        syncData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isOnline, dispatch]);

  useEffect(() => {
    dispatch(checkLogin());
  }, [dispatch]);

  useEffect(() => {
    if (user) toast.success("Signed in successfully");
  }, [user]);

  // useEffect(() => {
  //   if (user) {
  //     syncService.pullChanges(new Date().getTime());
  //   }
  // }, [user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // useEffect(() => {
  //   toast.loading("Uploading your file");
  // }, []);

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
