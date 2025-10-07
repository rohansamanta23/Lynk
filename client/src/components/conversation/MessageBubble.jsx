export default function MessageBubble({ message, isOwn }) {
  const formatTime = (time) => {
    if (!time) return "";
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isOwn
            ? "bg-gradient-to-tr from-[#00b4ff] to-[#0077ff] text-white rounded-br-sm"
            : "bg-[#1a1a1a] text-[#e5e5e5] border border-[#2e2e2e] rounded-bl-sm"
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{message.text}</p>
        <span
          className={`text-xs mt-1 block text-right ${
            isOwn ? "text-white/70" : "text-gray-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}