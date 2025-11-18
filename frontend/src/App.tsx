import { RouterProvider } from "react-router";
import "./App.css";
import Navbar from "./shared/components/Navbar";
import { router } from "./router";

function App() {
  return (
    <>
      <Navbar />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
