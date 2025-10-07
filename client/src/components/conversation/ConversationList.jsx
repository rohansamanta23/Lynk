import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getConversations } from "../../api/conversationApi.js";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ConversationBox from "./ConversationBox";
import {
  listenPresenceChanged,
  stopListenPresenceChanged,
} from "../../socket/events/user.js";
import { toast } from "sonner";

export default function ConversationList() {
  const navigate = useNavigate();
  const { conversationId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Sort conversations by latest update (most recent first)
  const sortByLatest = (list) =>
    [...list].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

  // Fetch initial conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        const sorted = sortByLatest(data);
        setConversations(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        toast.error("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(conversations);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filteredData = conversations.filter((conv) =>
      conv.displayUser?.name?.toLowerCase().includes(lowerQuery)
    );
    setFiltered(sortByLatest(filteredData));
  }, [query, conversations]);

  // Handle real-time presence updates
  useEffect(() => {
    const handlePresenceChange = (payload) => {
      if (!payload?.id || !payload?.status) return;

      setConversations((prev) =>
        prev.map((conv) =>
          conv.displayUser?.userId === payload.id
            ? {
                ...conv,
                displayUser: {
                  ...conv.displayUser,
                  status: payload.status,
                },
              }
            : conv
        )
      );
    };

    listenPresenceChanged(handlePresenceChange);
    return () => stopListenPresenceChanged(handlePresenceChange);
  }, []);

  // When a conversation is clicked
  const handleConversationClick = (conversation) => {
    navigate(`/chat/${conversation._id}`);
  };

  return (
    <aside className="py-6 px-3 flex flex-col shadow-xl backdrop-blur-xl min-h-screen">
      <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow mb-4">
        Conversations
      </h2>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="flex items-center bg-[#151515] border border-[#222] rounded-xl px-4 w-full h-10 focus-within:border-gray-100/50 focus-within:shadow-[0_0_8px_#555] transition">
          <Search className="text-[#00b4ff] mr-2" size={18} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="bg-transparent border-0 focus-visible:ring-0 text-[#e5e5e5] placeholder:text-gray-500"
            autoComplete="off"
          />
        </div>
      </div>

      <Separator className="mt-2 bg-gradient-to-r from-transparent via-[#2e2e2e] to-transparent" />

      {/* Conversation List */}
      <ScrollArea className="flex-1 pr-2">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-[#00b4ff]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-6">
            {query ? "No matching conversations" : "No conversations yet"}
          </p>
        ) : (
          filtered.map((conv, idx) => (
            <div key={conv._id}>
              <ConversationBox
                conversation={conv}
                onClick={handleConversationClick}
                isActive={conv._id === conversationId} // ✅ highlight active chat
              />
              {idx < filtered.length - 1 && (
                <Separator className="bg-gradient-to-r from-transparent via-[#2e2e2e] to-transparent" />
              )}
            </div>
          ))
        )}
      </ScrollArea>
    </aside>
  );
}
