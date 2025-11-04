import { Loader2, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useSocket } from "@/socket/SocketProvider";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getConversationById } from "@/api/conversationApi";
import { toast } from "sonner";
import ChatHeader from "./ChatHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  listenPresenceChanged,
  stopListenPresenceChanged,
} from "../../socket/events/user.js";

export default function ChatWindow() {
  const params = useParams();
  const conversationId = params.id || params.conversationId || null;
  const { user: me } = useAuthContext();
  const socket = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUserNearBottom, setIsUserNearBottom] = useState(true);
  const [displayUser, setDisplayUser] = useState(null);

  const feedRef = useRef(null);
  const bottomRef = useRef(null);

  // 🔹 Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (!bottomRef.current) return;
    bottomRef.current.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  // 🔹 Track if user is near bottom
  const handleScroll = useCallback(() => {
    if (!feedRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    setIsUserNearBottom(distanceFromBottom < 100);
  }, []);

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return;
    feed.addEventListener("scroll", handleScroll);
    return () => feed.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // 🔹 Fetch conversation meta
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (typeof getConversationById === "function") {
          const res = await getConversationById(conversationId);
          if (!mounted) return;
          setConversation(res);
          if (res?.messages) setMessages(res.messages);

          // Extract display user from participants
          const p = res?.participants || [];
          const other = p.find((pp) => String(pp._id) !== String(me?._id));
          setDisplayUser(other || { name: "Unknown", status: "offline" });
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
        toast.error("Failed to load conversation");
      } finally {
        if (mounted) setLoading(false);
        socket?.emit("conversation:join", { conversationId });
      }
    };
    load();

    return () => {
      mounted = false;
      socket?.emit("conversation:leave", { conversationId });
    };
  }, [conversationId]);

  // 🔹 Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload) => {
      if (!payload || String(payload.conversationId) !== String(conversationId))
        return;
      setMessages((prev) => [...prev, payload.message]);
    };

    socket.on("conversation:newMessage", onNewMessage);
    return () => socket.off("conversation:newMessage", onNewMessage);
  }, [socket, conversationId]);

  // 🔹 Auto scroll to bottom when messages change
  useEffect(() => {
    if (isUserNearBottom) scrollToBottom(true);
  }, [messages.length]);

  // 🔹 Initial scroll
  useEffect(() => {
    if (!loading) scrollToBottom(false);
  }, [loading]);

  // 🔹 Send message handler
  const handleSend = async (text) => {
    if (!conversationId) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      text,
      sender: { _id: me?._id, name: me?.name, userId: me?.userId },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom(true);

    try {
      socket?.emit("conversation:message", { conversationId, text }, (ack) => {
        if (!ack?.ok) {
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          toast.error(ack?.message || "Failed to send message");
          return;
        }
        if (ack.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? ack.message : m))
          );
          scrollToBottom(true);
        }
      });
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      toast.error("Failed to send message");
    }
  };

  // 🔹 Listen for presence updates (live avatar + status)
  useEffect(() => {
    const handlePresenceChange = (payload) => {
      if (!payload?.id || !displayUser) return;
      if (payload.id === displayUser.userId) {
        setDisplayUser((prev) => ({
          ...prev,
          status: payload.status,
        }));
      }
    };

    listenPresenceChanged(handlePresenceChange);
    return () => stopListenPresenceChanged(handlePresenceChange);
  }, [displayUser?.userId]);

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Header */}
      <ChatHeader displayUser={displayUser} />

      {/* Message feed */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto px-6 pt-2 space-y-4 scrollbar-thin scrollbar-thumb-[#444] scrollbar-track-transparent"
      >
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#00b4ff]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-[80%] flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="mb-2">No messages yet</p>
              <p className="text-sm text-gray-500">
                Say hi to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m._id}
              message={m}
              isOwn={String(m.sender?._id) === String(me?._id)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {!isUserNearBottom && (
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-24 right-6 z-20 bg-gradient-to-r from-[#c0c0c0] to-[#a0a0a0] text-[#111] shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:from-[#d3d3d3] hover:to-[#b3b3b3] transition rounded-full p-3"
          >
            <ArrowDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <div>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
