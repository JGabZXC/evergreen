import { RouterProvider } from "react-router";
import "./App.css";
import { router } from "./router/mainRouter";
import { AuthProvider } from "./features/auth";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <AuthProvider>
        <ToastContainer />
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
