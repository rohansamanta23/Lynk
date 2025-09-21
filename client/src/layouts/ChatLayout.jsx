import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner.jsx";

function ChatLayout() {
  return (
    <>
      <h1 className="text-2xl font-bold">Chat Application</h1>
      <Toaster />
    </>
  );
}

export default ChatLayout;
