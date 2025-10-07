export default function ConversationBox({ conversation, onClick, isActive }) {
  const user = conversation.displayUser;
  const lastMessage = conversation.lastMessage?.text || "Spark a conversation!";
  const updatedAt = conversation.lastMessage?.createdAt || conversation.updatedAt;

  // Avatar border color logic
  let borderColor = "border-[3px] border-[#888]";
  if (user?.status === "online") {
    borderColor = "border-[3px] border-[#00b4ff] shadow-[0_0_12px_#444]";
  }

  // Active (selected) conversation border override
  const activeBorder = isActive ? "border-white" : "border-[#222]/0";

  const handleClick = () => {
    onClick?.(conversation);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(conversation);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`flex items-center justify-between rounded-2xl px-4 py-3 border-2 ${activeBorder} hover:border-gray-600 transition cursor-pointer focus:outline-none focus:border-[#c7c5c5] hover:scale-[.98]`}
    >
      <div className="flex items-center gap-4 w-full">
        <div
          className={`flex items-center justify-center h-11 w-11 rounded-full uppercase text-lg bg-gradient-to-tr from-[#333] to-[#111] text-zinc-300 ${borderColor}`}
        >
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-base text-[#e5e5e5] font-semibold tracking-wide truncate">
              {user?.name || "Unknown"}
            </span>
            <span className="text-xs text-gray-400/70 font-mono ml-2 whitespace-nowrap">
              {new Date(updatedAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
          <span className="text-sm text-gray-400 font-mono mt-0.5 truncate">
            {lastMessage}
          </span>
        </div>
      </div>
    </div>
  );
}
