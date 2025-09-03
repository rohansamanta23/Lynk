import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Login from "../pages/Auth/Login";
import { Toaster } from "@/components/ui/sonner.jsx";

function AuthLayout() {
  return (
    <>
      <Navbar />
      <div className='h-[10vh]'></div>
      <Outlet />
      <Toaster />
    </>
  );
}

export default AuthLayout;
