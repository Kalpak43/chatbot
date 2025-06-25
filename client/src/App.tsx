import { Suspense, useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router";
import Layout from "./layouts/chat-layout";
import Chatpage from "./pages/Chatpage";
import Loginpage from "./pages/Loginpage";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { toast } from "sonner";
import { checkLogin } from "./features/auth/authThunk";
import Signuppage from "./pages/Signuppage";
import { getChats } from "./features/chats/chatThunk";
import PersonalizationPage from "./pages/personalization-page";
import SettingsLayout from "./layouts/settings-layout";
import ProctectedRoute from "./components/auth/protected-route";
import ContactUsPage from "./pages/contact-us-page";
import { updateLimit } from "./features/prompt/promptSlice";
import { AnimatePresence } from "motion/react";
import PageTransition from "./components/page-transition";

function App() {
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);
  const error = useAppSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(checkLogin());
  }, [dispatch]);

  useEffect(() => {
    const limit = localStorage.getItem("Ratelimit-Limit") ?? (user ? 30 : 10);
    const remaining =
      localStorage.getItem("Ratelimit-Remaining") ?? (user ? 30 : 10);
    const reset = localStorage.getItem("Ratelimit-Reset");

    dispatch(updateLimit({ limit, remaining, reset }));
  }, [dispatch, user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <Suspense>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Chatpage />
                </PageTransition>
              }
            />
            <Route
              path="/chat/:chatId?"
              element={
                <PageTransition>
                  <Chatpage />
                </PageTransition>
              }
            />
          </Route>
          <Route element={<ProctectedRoute />}>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route
                path="personalization"
                element={
                  <Suspense fallback={<>Loading...</>}>
                    <PageTransition>
                      <PersonalizationPage />
                    </PageTransition>
                  </Suspense>
                }
              />
              <Route
                path="contact-us"
                element={
                  <PageTransition>
                    <ContactUsPage />
                  </PageTransition>
                }
              />
            </Route>
          </Route>
          <Route
            path="/login"
            element={
              <PageTransition>
                <Loginpage />
              </PageTransition>
            }
          />
          <Route
            path="/signup"
            element={
              <PageTransition>
                <Signuppage />
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;
