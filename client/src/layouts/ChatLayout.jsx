import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner.jsx";

function ChatLayout() {
  return (
    <>
      <Navbar />
      <div className='h-[10vh]'></div>
      <Toaster />
    </>
  );
}

export default ChatLayout;
