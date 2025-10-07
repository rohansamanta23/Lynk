import { MoreVertical } from "lucide-react";

export default function ChatHeader({ displayUser }) {
  return (
    <header className='mx-2 mt-2 flex items-center gap-4 px-6 py-4 border border-[#232323] bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] rounded-[12px] shadow-lg'>
      <div className='flex items-center gap-3'>
        {(() => {
          let borderColor = "border-[3px] border-[#888]";
          if (displayUser?.status === "online") {
            borderColor =
              "border-[3px] border-[#00b4ff] shadow-[0_0_12px_#444]";
          }
          return (
            <div
              className={`flex items-center justify-center h-12 w-12 rounded-full uppercase text-lg bg-gradient-to-tr from-[#333] to-[#111] text-zinc-300 ${borderColor}`}
            >
              {displayUser?.name?.[0]?.toUpperCase() || "?"}
            </div>
          );
        })()}
        <div className='flex flex-col'>
          <span className='text-lg font-semibold text-[#e5e5e5]'>
            {displayUser?.name || "Unknown"}
          </span>
          <span className='text-xs text-gray-400'>
            {displayUser?.status === "online" ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className='ml-auto flex items-center gap-3'>
        <button className='p-2 rounded-md hover:bg-[#1b1b1b] text-[#cfcfcf]'>
          <MoreVertical size={16} />
        </button>
      </div>
    </header>
  );
}
