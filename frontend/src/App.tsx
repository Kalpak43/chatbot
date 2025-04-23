import { Route, Routes } from "react-router";
import "./App.css";
import Layout from "./Layout";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { checkLogin } from "./features/auth/authThunk";
import { useToast } from "./hooks/useToast";
import { lazy, Suspense } from "react";
import { useSync } from "./hooks/useSync";

// const Homepage = lazy(() => import("./pages/Homepage"));
const Chatpage = lazy(() => import("./pages/Chatpage"));
const Loginpage = lazy(() => import("./pages/Loginpage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));

function App() {
  const { user, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { syncData, isOnline } = useSync();

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
