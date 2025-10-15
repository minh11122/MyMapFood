import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import { AppRouter } from "@/app/app-router";
import { Toaster } from "react-hot-toast";
import { ChatAI } from "./pages";
import { CartProvider } from "./contexts/cart-context";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppRouter />
        <ChatAI />
        <Toaster />
    </GoogleOAuthProvider>
  </StrictMode>
);
