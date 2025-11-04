import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px"; // reset height
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // 🔹 Auto-resize textarea height dynamically
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [text]);

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative z-10
        flex items-end gap-3
        px-3 py-3
        mx-2 mb-2
        bg-[#0b0b0b]/90
        border border-[#3a3a3a]
        rounded-2xl
        backdrop-blur-lg
        shadow-[0_0_25px_rgba(0,0,0,0.6)]
        transition-all duration-300
      "
    >
      {/* 🔸 Textarea Input */}
      <div
        className="
          flex-1 flex items-center
          bg-[#151515]/95
          border border-[#4d4d4d]
          rounded-2xl px-4 py-2
          focus-within:border-[#c0c0c0]
          transition-all duration-300
          min-h-[52px]
        "
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="
            w-full
            resize-none overflow-y-auto
            bg-transparent border-0 outline-none
            text-[#f5f5f5] placeholder:text-gray-500
            text-[15px] leading-relaxed
            max-h-40
            pt-[5px]
            pb-[5px]
          "
          rows={1}
        />
      </div>

      {/* 🔸 Send Button */}
      <button
        type="submit"
        disabled={!text.trim()}
        className="
          flex items-center justify-center
          h-[52px] w-[52px]
          rounded-2xl
          bg-gradient-to-tr from-[#bfbfbf] to-[#dcdcdc]
          text-black
          hover:shadow-[0_0_18px_#c0c0c060]
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-[#c0c0c0]
        "
      >
        <Send size={20} />
      </button>
    </form>
  );
}
