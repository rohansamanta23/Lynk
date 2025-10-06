import { useState, useEffect } from "react";
import { toast } from "sonner";
import UserCard from "./UserCard";
import { Button } from "@/components/ui/button";
import { getSentRequests } from "@/api/friendshipApi.js";
import {
  listenFriendSent,
  stopListenFriendSent,
  listenFriendCancelled,
  stopListenFriendCancelled,
  listenFriendAccepted,
  stopListenFriendAccepted,
  cancelFriendRequest,
} from "@/socket/events/friendship.js";

export default function SendRequests() {
  const [sent, setSent] = useState([]);

  useEffect(() => {
    const fetchSentRequests = async () => {
      try {
        const data = await getSentRequests();
        setSent(data || []);
      } catch {
        toast.error("Error fetching sent requests");
      }
    };

    const handleSent = (payload) => {
      console.log("[SendRequests] friend:sent", payload);
      setSent((prev) => {
        if (prev.some((r) => r.friendshipId === payload.friendshipId)) return prev;
        return [
          {
            friendshipId: payload.friendshipId || payload._id,
            recipient: payload.recipient,
          },
          ...prev,
        ];
      });
    };

    const handleCancelled = (payload) => {
      console.log("[SendRequests] friend:cancelled", payload);
      setSent((prev) =>
        prev.filter((r) => r.friendshipId !== payload.friendshipId)
      );
    };

    const handleAccepted = (payload) => {
      console.log("[SendRequests] friend:accepted", payload);
      setSent((prev) =>
        prev.filter((r) => r.friendshipId !== payload.friendship._id)
      );
    };

    listenFriendSent(handleSent);
    listenFriendCancelled(handleCancelled);
    listenFriendAccepted(handleAccepted);   // ✅ hook accepted listener
    fetchSentRequests();

    return () => {
      stopListenFriendSent(handleSent);
      stopListenFriendCancelled(handleCancelled);
      stopListenFriendAccepted(handleAccepted); // ✅ cleanup
    };
  }, []);

  const handleCancel = async (friendshipId) => {
    // Optimistic UI update
    setSent((prev) => prev.filter((r) => r.friendshipId !== friendshipId));

    try {
      await cancelFriendRequest(friendshipId);
    } catch (err) {
      toast.error(err.message || "Failed to cancel request");
      // Rollback UI if failed
      await getSentRequests().then(setSent).catch(() => {});
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 h-20 flex items-center px-7 bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] border-b border-[#222] shadow-lg">
        <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow">
          Sent Requests
        </h2>
      </div>

      {/* List */}
      <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
        {sent.map((item) => {
          const user = {
            id:
              item.recipient?.userId ||
              item.recipient?._id ||
              item.userId ||
              item.id ||
              "?",
            name: item.recipient?.name || item.name || "",
            status: item.recipient?.status || item.status || "offline",
          };

          return (
            <UserCard
              key={item.friendshipId || item._id || item.id}
              user={user}
              type="sent"
              actions={
                <Button
                  onClick={() => handleCancel(item.friendshipId)}
                  className="px-4 py-1 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#232526] to-[#414345] text-white hover:scale-105 border-2 border-gray-600 transition"
                >
                  Cancel
                </Button>
              }
            />
          );
        })}
        {sent.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            No sent requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
