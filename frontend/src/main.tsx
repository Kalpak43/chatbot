import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import Toast from "./components/Toast";
import { ToastProvider } from "./hooks/useToast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <div data-theme="glassmorph-dark">
          <ToastProvider>
            <App />
            <Toast />
          </ToastProvider>
        </div>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
