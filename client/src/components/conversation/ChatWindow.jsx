import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import { useSocket } from "@/socket/SocketProvider"; // your provider hook
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { getConversationById } from "@/api/conversationApi"; // optional: your API
import { toast } from "sonner";
import ChatHeader from "./ChatHeader";

/**
 * ChatWindow
 * - Route param: expects conversation id at params.id (works with /chat/:id)
 * - Fetches initial conversation (participants, lastMessage, etc) via API if available
 * - Loads initial messages via socket request or API (if you have message API)
 * - Listens to "conversation:newMessage" events and appends messages
 * - Emits "conversation:message" on send
 */
export default function ChatWindow() {
  const params = useParams();
  const conversationId = params.id || params.conversationId || null;
  const { user: me } = useAuthContext();
  const socket = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const feedRef = useRef(null);
  const bottomRef = useRef(null);

  // scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    try {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
          block: "end",
        });
      } else if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  // fetch conversation meta (optional) - adapt to your API shape
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
          // if API returns messages include them; else keep messages empty
          if (res?.messages) setMessages(res.messages);
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        if (mounted) setLoading(false);
        // join the room (emit join via socket)
        try {
          socket?.emit("conversation:join", { conversationId }, (ack) => {
            // optional handling
            if (!ack?.ok) console.warn("Join ack:", ack);
          });
        } catch (e) {}
      }
    };
    load();

    return () => {
      mounted = false;
      // optionally leave conversation room
      socket?.emit("conversation:leave", { conversationId }, () => {});
    };
  }, [conversationId]);

  // listen for new message events for this conversation
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload) => {
      // payload = { conversationId, message: { _id, text, sender, createdAt } }
      if (!payload) return;
      if (String(payload.conversationId) !== String(conversationId)) return;
      setMessages((prev) => [...prev, payload.message]);
      // move conversation to top handled by conversation list socket (conversation:updated)
      scrollToBottom(true);
    };

    socket.on("conversation:newMessage", onNewMessage);

    // optional: also listen for conversation:updated or message:seen etc later

    return () => {
      socket.off("conversation:newMessage", onNewMessage);
    };
  }, [socket, conversationId, scrollToBottom]);

  // scroll to bottom after initial messages load
  useEffect(() => {
    scrollToBottom(false);
  }, [loading, scrollToBottom]);

  // send message handler
  const handleSend = async (text) => {
    if (!conversationId) return;

    // optimistic id + message
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      text,
      sender: { _id: me?._id, name: me?.name, userId: me?.userId },
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom(true);

    // emit via socket
    try {
      socket?.emit("conversation:message", { conversationId, text }, (ack) => {
        if (!ack?.ok) {
          // remove optimistic message or mark failed
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
          toast.error(ack?.message || "Failed to send message");
          return;
        }
        // replace optimistic with official message if ack contains message
        if (ack.message) {
          setMessages((prev) =>
            prev.map((m) => (m._id === tempId ? ack.message : m))
          );
        }
      });
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      toast.error("Failed to send message");
    }
  };

  // render header info (display user)
  const displayUser =
    conversation?.displayUser ||
    (() => {
      // fallback: if conversation has participants, pick the other one
      const p = conversation?.participants || [];
      const other = p.find((pp) => String(pp._id) !== String(me?._id));
      return other || { name: "Unknown", status: "offline" };
    })();

  return (
    <div className='flex-1 flex flex-col  h-full'>
      {/* Header */}
      <ChatHeader displayUser={displayUser} />

      {/* Messages feed */}
      <div
        ref={feedRef}
        className='flex-1 overflow-y-auto px-6 py-6 space-y-4'
      >
        {loading ? (
          <div className='flex justify-center items-center py-10'>
            <Loader2 className='h-6 w-6 animate-spin text-[#00b4ff]' />
          </div>
        ) : messages.length === 0 ? (
          <div className='h-[95%] flex items-center justify-center text-gray-400'>
            <div className='text-center'>
              <p className='mb-2'>No messages yet</p>
              <p className='text-sm text-gray-500'>
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

        {/* bottom anchor for scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
