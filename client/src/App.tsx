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

function App() {
  const dispatch = useAppDispatch();

  const error = useAppSelector((state) => state.auth.error);

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(checkLogin());
  }, [dispatch]);

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
        <Route element={<ProctectedRoute />}>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route
              path="personalization"
              element={
                <Suspense fallback={<>Loading...</>}>
                  <PersonalizationPage />
                </Suspense>
              }
            />
            <Route path="contact-us" element={<ContactUsPage />} />
          </Route>
        </Route>
        <Route path="/login" element={<Loginpage />} />
        <Route path="/signup" element={<Signuppage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
