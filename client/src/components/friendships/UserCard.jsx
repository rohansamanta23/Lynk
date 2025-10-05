import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator.jsx";

// type: 'friend', 'request', 'sent', 'blocked'
export default function UserCard({
  user,
  type,
  active = false,
  actions = null,
  menu = null,
}) {
  // Avatar border color logic
  let borderColor = "border-3 border-[#888]";
  if (type === "friend" && active)
    borderColor = "border-3 border-[#00b4ff] shadow-[0_0_12px_#444]";
  if (type === "blocked") borderColor = "border-3 border-red-600";

  // Card border hover color
  let hoverBorder = "hover:border-gray-600 hover:border-2";
  if (type === "blocked") hoverBorder = "hover:border-[#783a3a] hover:border-2";
  if (type === "friend") hoverBorder = "hover:border-gray-600 hover:border-2";

  // Prefer userId for avatar, fallback to name or id
  const avatarLetter =
    user?.userId?.[0] || user?.name?.[0] || user?.id?.[0] || "?";
  return (
    <div
      className={`flex items-center mx-6 justify-between bg-[#151515] border-2 border-[#222] rounded-2xl px-4 py-4 ${hoverBorder} transition`}
    >
      {/* Left: Avatar + Name + UserID */}
      <div className='flex items-center gap-4'>
        <div
          className={`flex items-center justify-center h-11 w-11 rounded-full uppercase text-lg bg-gradient-to-tr from-[#333] to-[#111] text-zinc-300 ${borderColor}`}
        >
          {avatarLetter}
        </div>
        <div className='flex flex-col'>
          <span className='text-[#e5e5e5] font-semibold tracking-wide'>
            {user?.name || user?.userId || user?.id || ""}
          </span>
          <span className='text-xs text-gray-400 font-mono mt-0.5'>
            {user?.userId || user?.id || ""}
          </span>
        </div>
      </div>
      {/* Actions or Menu */}
      {actions}
      {menu}
    </div>
  );
}
