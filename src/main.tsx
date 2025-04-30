import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Layout from "./components/Layout";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./lib/ThemeProvider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />
      },
      {
        path: "chat",
        element: <Chat />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="ai-humanizer-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
