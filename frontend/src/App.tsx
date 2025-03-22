import { Route, Routes } from "react-router";
import "./App.css";
import Homepage from "./pages/Homepage";
import Chatpage from "./pages/Chatpage";
import Layout from "./Layout";
import Testpage from "./pages/Testpage";
import Loginpage from "./pages/Loginpage";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { checkLogin } from "./features/auth/authThunk";
import SignupPage from "./pages/SignupPage";
import { useToast } from "./hooks/useToast";

function App() {
  const { user, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

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
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/chat/:chatId" element={<Chatpage />} />
        <Route path="/test" element={<Testpage />} />
      </Route>
      <Route path="/login" element={<Loginpage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;
