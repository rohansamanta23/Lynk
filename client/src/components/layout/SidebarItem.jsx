import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function SidebarItem({ icon, label, active, onClick }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "p-3 rounded-xl flex items-center justify-center transition-colors",
            active
              ? "bg-gradient-to-r from-[#d4d4d4] via-[#bfbfbf] to-[#8f8f8f] text-black ring-2 ring-[#bfbfbf]"
              : "hover:bg-gray-800 text-gray-400"
          )}
        >
          {icon}
        </button>
      </TooltipTrigger>
      <TooltipContent side='right'>{label}</TooltipContent>
    </Tooltip>
  );
}
