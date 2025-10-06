export default function ConversationBox({ conversation }) {
  const user = conversation.displayUser;
  const lastMessage = conversation.lastMessage?.text || "Spark a conversation!";
  const updatedAt = conversation.lastMessage?.createdAt || conversation.updatedAt;

  // Avatar border color logic
  let borderColor = "border-3 border-[#888]";
  if (user?.status === "online")
    borderColor = "border-3 border-[#00b4ff] shadow-[0_0_12px_#444]";

  // 🔹 Helper: format timestamps like WhatsApp
  const formatTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = diffMs / (1000 * 60);
    const diffHours = diffMins / 60;
    const diffDays = diffHours / 24;

    if (diffDays < 1) {
      // Same day → show time like "2:30 PM"
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffDays < 2) {
      // Yesterday → show "1 d ago"
      return "1 d ago";
    } else if (diffDays < 7) {
      // Within a week → show "3 d ago"
      return `${Math.floor(diffDays)} d ago`;
    } else {
      // Older → show "MM/DD/YYYY"
      return date.toLocaleDateString([], {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div
      className={`flex items-center justify-between border-2 border-[#222]/0 rounded-2xl px-4 py-3 hover:border-gray-600 hover:border-2 transition cursor-pointer`}
    >
      {/* Left: Avatar + Info */}
      <div className="flex items-center gap-4 w-full">
        <div
          className={`flex items-center justify-center h-11 w-11 rounded-full uppercase text-lg bg-gradient-to-tr from-[#333] to-[#111] text-zinc-300 ${borderColor}`}
        >
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>

        {/* Name + Last Message */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span className="text-base text-[#e5e5e5] font-semibold tracking-wide truncate">
              {user?.name || "Unknown"}
            </span>
            {/* Timestamp (aligned right) */}
            <span className="text-xs text-gray-400/70 font-mono ml-2 whitespace-nowrap">
              {formatTime(updatedAt)}
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
