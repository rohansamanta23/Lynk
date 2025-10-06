import { useState, useEffect } from "react";
import { toast } from "sonner";
import UserCard from "./UserCard";
import { Button } from "@/components/ui/button";
import { getReceivedRequests } from "@/api/friendshipApi.js";
import {
  listenFriendIncoming,
  stopListenFriendIncoming,
  listenFriendCancelled,
  stopListenFriendCancelled,
  acceptFriendRequest,
  rejectFriendRequest, // ✅ added
} from "@/socket/events/friendship.js";

export default function FriendRequests() {
  const [received, setReceived] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchReceivedRequests = async () => {
      try {
        const data = await getReceivedRequests();
        setReceived(data || []);
      } catch {
        toast.error("Error fetching received requests");
      }
    };

    const handleIncoming = (payload) => {
      console.log("[FriendRequests] friend:incoming", payload);
      setReceived((prev) => {
        if (prev.some((r) => r.friendshipId === payload.friendshipId))
          return prev;
        return [
          {
            friendshipId: payload.friendshipId || payload._id,
            requester: payload.requester,
          },
          ...prev,
        ];
      });
    };

    const handleCancelled = (payload) => {
      console.log("[FriendRequests] friend:cancelled", payload);
      setReceived((prev) =>
        prev.filter((r) => r.friendshipId !== payload.friendshipId)
      );
    };

    listenFriendIncoming(handleIncoming);
    listenFriendCancelled(handleCancelled);
    fetchReceivedRequests();

    return () => {
      stopListenFriendIncoming(handleIncoming);
      stopListenFriendCancelled(handleCancelled);
    };
  }, []);

  const handleAccept = async (friendshipId) => {
    if (loadingId) return;
    setLoadingId(friendshipId);

    acceptFriendRequest(friendshipId, (res) => {
      setLoadingId(null);
      if (!res.ok) {
        toast.error(res.message || "Accept failed");
      } else {
        toast.success("Friend request accepted");
        setReceived((prev) =>
          prev.filter((r) => r.friendshipId !== friendshipId)
        );
      }
    });
  };

  const handleDecline = async (friendshipId) => {
    if (loadingId) return;
    setLoadingId(friendshipId);

    rejectFriendRequest(friendshipId, (res) => {
      setLoadingId(null);
      if (!res.ok) {
        toast.error(res.message || "Failed to decline");
      } else {
        toast.info("Friend request declined");
        setReceived((prev) =>
          prev.filter((r) => r.friendshipId !== friendshipId)
        );
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 h-20 flex items-center px-7 bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] border-b border-[#222] shadow-lg">
        <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow">
          Received Requests
        </h2>
      </div>

      {/* List */}
      <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
        {received.map((item) => {
          const user = {
            id:
              item.requester?.userId ||
              item.requester?._id ||
              item.userId ||
              item.id ||
              "?",
            name: item.requester?.name || item.name || "",
            status: item.requester?.status || item.status || "offline",
          };

          const isLoading = loadingId === item.friendshipId;

          return (
            <UserCard
              key={item.friendshipId || item._id || item.id}
              user={user}
              type="request"
              actions={
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAccept(item.friendshipId)}
                    disabled={isLoading}
                    className={`px-4 py-1 text-sm font-semibold rounded-xl border-2 border-gray-600 transition ${
                      isLoading
                        ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#c0c0c0] via-[#e0e0e0] to-[#a0a0a0] text-[#222] hover:scale-105"
                    }`}
                  >
                    {isLoading ? "Accepting..." : "Accept"}
                  </Button>

                  <Button
                    onClick={() => handleDecline(item.friendshipId)}
                    disabled={isLoading}
                    className={`px-4 py-1 text-sm font-semibold rounded-xl border-2 border-gray-600 transition ${
                      isLoading
                        ? "bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#232526] to-[#414345] text-white hover:shadow-[0_0_8px_#232526] hover:scale-105"
                    }`}
                  >
                    {isLoading ? "Declining..." : "Decline"}
                  </Button>
                </div>
              }
            />
          );
        })}
        {received.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            No received requests yet.
          </p>
        )}
      </div>
    </div>
  );
}
