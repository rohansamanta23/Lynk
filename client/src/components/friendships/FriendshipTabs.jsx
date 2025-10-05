import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, Mail, Send, Ban } from "lucide-react";
import { NavLink } from "react-router-dom";

const tabs = [
  {
    label: "Friend List",
    icon: Users,
    to: "/friendship/friendlist",
    key: "friendlist",
  },
  {
    label: "Received Requests",
    icon: Mail,
    to: "/friendship/request",
    key: "request",
  },
  { label: "Sent Requests", icon: Send, to: "/friendship/sent", key: "sent" },
  {
    label: "Send Request",
    icon: UserPlus,
    to: "/friendship/search",
    key: "search",
  },
  {
    label: "Blocked",
    icon: Ban,
    to: "/friendship/blocklist",
    key: "blocklist",
  },
];

export default function FriendshipTabs() {
  const getTabClass = (isActive) =>
    `font-style justify-start rounded-xl px-5 py-4 text-sm font-bold transition-all flex items-center gap-2 select-none cursor-pointer ` +
    (isActive
      ? "bg-gradient-to-r from-[#e5e5e5] via-[#bfbfbf] to-[#a3a3a3] text-[#000] border border-[#bfbfbf] shadow-md font-bold  hover:text-[#000]"
      : "text-[#e5e5e5] hover:bg-[#555]/10 hover:text-[#00b4ff] border border-transparent hover:border-[#bfbfbf]");

  return (
    <aside className='w-64 p-6 flex flex-col shadow-xl backdrop-blur-xl min-h-screen'>
      <h2 className='text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow mb-4'>
        Tabs
      </h2>

      <Separator className='my-2 bg-gradient-to-r from-transparent via-[#2e2e2e] to-transparent' />

      {tabs.map(({ label, icon: Icon, to, key }, idx) => (
        <div key={key}>
          <NavLink
            to={to}
            className={({ isActive }) => getTabClass(isActive)}
            end
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            draggable={false}
            tabIndex={0}
          >
            <Icon className='mr-2 h-5 w-5 text-[#00b4ff]' />
            {label}
          </NavLink>
          {idx < tabs.length - 1 && (
            <Separator className='my-2 bg-gradient-to-r from-transparent via-[#2e2e2e] to-transparent' />
          )}
        </div>
      ))}
    </aside>
  );
}
