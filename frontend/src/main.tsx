import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const isDev = import.meta.env.DEV;

createRoot(document.getElementById("root")!).render(
  isDev ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
);
