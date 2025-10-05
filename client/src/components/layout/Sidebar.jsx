import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { Settings, MessageSquare, User } from "lucide-react";
import SidebarItem from "./SidebarItem";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator.jsx";

export default function Sidebar({ active }) {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  return (
    <aside className='h-screen w-17 bg-[#050505] text-white flex flex-col items-center py-7 justify-between'>
      {/* Top: App Logo */}
      <div className='flex flex-col items-center'>
        <img
          src='/assets/lynk_logo.png'
          alt='Lynk Logo'
          className='w-10 h-10 mb-6 rounded'
          draggable={false}
        />
      </div>

      <div className='flex flex-col gap-4 items-center'>
        <TooltipProvider>
          <SidebarItem
            icon={<MessageSquare size={25} />}
            label='Convesations'
            active={active === "chat"}
            onClick={() => navigate("/chat")}
          />
          <SidebarItem
            icon={<User size={25} />}
            label='Friendships'
            active={active === "friendship"}
            onClick={() => navigate("/friendship")}
          />
        </TooltipProvider>
      </div>

      {/* Bottom: Settings with Dropdown */}
      <TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <SidebarItem
                icon={<Settings size={22} />}
                label='Settings'
                active={active === "settings"}
                onClick={() => {}}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='bg-[#111]/95 backdrop-blur-md border border-[#2a2a2a] text-[#cfcfcf] shadow-[0_4px_20px_rgba(0,0,0,0.7)] rounded-2xl px-1 py-2'
          >
            <DropdownMenuItem
              className='relative cursor-pointer px-3 py-2 rounded-lg transition bg-transparent hover:bg-transparent hover:text-transparent bg-clip-text font-medium text-red-400 hover:bg-gradient-to-r hover:from-red-400 hover:to-red-600'
              // TODO: Add logout logic here
              onClick={async () => {
                if (logout) {
                  await logout();
                }
                navigate("/auth/login");
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    </aside>
  );
}
