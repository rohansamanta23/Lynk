import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import Navbar from "../components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner.jsx";

function AuthLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
        <Outlet />
      </Suspense>
      <Toaster />
    </>
  );
}

export default AuthLayout;
