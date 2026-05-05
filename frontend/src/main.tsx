    <App />
      <App />
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
const queryClient = new QueryClient();
const isDev = import.meta.env.DEV;

createRoot(document.getElementById("root")!).render(
  isDev ? (
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
      <App />
    </StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
    <App />
  )
);
