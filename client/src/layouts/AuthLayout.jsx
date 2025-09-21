import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner.jsx";

function AuthLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Toaster />
    </>
  );
}

export default AuthLayout;
