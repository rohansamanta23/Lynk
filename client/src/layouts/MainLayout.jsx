import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner.jsx";
import Sidebar from "@/components/layout/Sidebar.jsx";

function MainLayout() {
  const location = useLocation();

  // detect which page is active
  const path = location.pathname;
  const active =
    path.startsWith("/chat")
      ? "chat"
      : path.startsWith("/friendship")
      ? "friendship"
      : path.startsWith("/settings")
      ? "settings"
      : "";

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar stays fixed width */}
      <aside className="flex flex-col bg-[#050505] text-white">
        <Sidebar active={active} />
      </aside>

      {/* Main content wrapper */}
      <main className="flex-1 h-full  overflow-hidden bg-[#050505]">
        <div className="h-full w-full bg-gray-700 rounded-2xl shadow-2xl border-2 border-gray-800  relative z-10 overflow-hidden">
          <Outlet />
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

export default MainLayout;
