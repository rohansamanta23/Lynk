import { ArrowLeft, EllipsisVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function ChatHeader({ displayUser = {}, onUnfriend, onBlock }) {
  const navigate = useNavigate();

  // Safely derive fields with fallbacks
  const name = displayUser?.name ?? "Unknown";
  const status = displayUser?.status ?? "offline";
  const avatar = displayUser?.avatar ?? null;

  const borderColor =
    status === "online"
      ? "border-[3px] border-[#00b4ff] shadow-[0_0_15px_#00b4ff80]"
      : "border-[3px] border-[#888] shadow-[0_0_10px_#222]";

  return (
    <header className="mx-2 mt-2 flex items-center gap-4 px-6 py-4 border border-[#232323] bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] rounded-[12px] shadow-lg">
      <div className="flex items-center gap-3">
        {/* Back button (optional) */}
        {/* <button onClick={() => navigate(-1)} className="text-[#e5e5e5] hover:text-[#00b4ff] transition">
          <ArrowLeft size={20} />
        </button> */}

        {/* Avatar with glow */}
        <motion.div
          className={`relative w-12 h-12 rounded-full flex items-center justify-center ${borderColor} transition-all duration-300`}
          animate={
            status === "online"
              ? {
                  boxShadow: [
                    "0 0 10px #00b4ff80",
                    "0 0 18px #00b4ff60",
                    "0 0 10px #00b4ff80",
                  ],
                }
              : { boxShadow: "0 0 10px #222" }
          }
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
        >
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar || undefined} alt={name} />
            <AvatarFallback className="bg-[#333] text-[#aaa]">
              {(name?.[0] || "?").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex flex-col">
          <span className="text-lg font-semibold text-[#e5e5e5]">
            {name}
          </span>
          <span
            className={`text-xs ${
              status === "online" ? "text-[#00b4ff]" : "text-gray-400"
            }`}
          >
            {status === "online" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-[#1b1b1b] text-[#cfcfcf]">
              <EllipsisVertical size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#0f0f0f] border border-[#2a2a2a] text-white shadow-lg rounded-lg w-44 p-1"
          >
            <DropdownMenuItem
              onClick={onUnfriend}
              className="cursor-pointer px-3 py-2 rounded-md font-medium text-white hover:bg-[#c0c0c0] hover:text-[#111]"
            >
              Unfriend
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onBlock}
              className="cursor-pointer px-3 py-2 rounded-md font-medium text-white hover:bg-red-600"
            >
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
