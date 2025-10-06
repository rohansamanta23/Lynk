import UserCard from "./UserCard";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator.jsx";
import { getFriendList } from "@/api/friendshipApi.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  listenFriendAccepted,
  stopListenFriendAccepted,
  listenFriendRemoved,
  stopListenFriendRemoved,
  removeFriend,
} from "@/socket/events/friendship.js";
import {
  listenPresenceChanged,
  stopListenPresenceChanged,
} from "@/socket/events/user.js";

export default function FriendList() {
  const [friends, setFriends] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // 🔹 Sort by friend name
  const sortFriends = (list) =>
    [...list].sort((a, b) => {
      const nameA = (a.friend?.name || a.name || "").toLowerCase();
      const nameB = (b.friend?.name || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // 🔹 Fetch initial list
  const fetchFriends = async () => {
    try {
      const data = await getFriendList();
      setFriends(sortFriends(data));
    } catch {
      toast.error("Failed to fetch friends.");
    }
  };

  useEffect(() => {
    fetchFriends();

    // ---- Friend accepted ----
    const handleFriendAccepted = async (payload) => {
      console.log("[FriendList] friend:accepted", payload);

      if (!payload?.friend || !payload.friend?.name) {
        await fetchFriends();
        return;
      }

      setFriends((prev) => {
        const exists = prev.some(
          (f) => f.friendshipId === payload.friendshipId
        );
        const updated = exists
          ? prev
          : [
              {
                friendshipId: payload.friendshipId || payload._id,
                friend: payload.friend,
              },
              ...prev,
            ];
        return sortFriends(updated);
      });
    };

    // ---- Friend removed ----
    const handleFriendRemoved = (payload) => {
      console.log("[FriendList] friend:removed", payload);
      setFriends((prev) =>
        sortFriends(
          prev.filter((f) => f.friendshipId !== payload.friendshipId)
        )
      );
      toast.info("Friend removed");
    };

    // ---- Presence change ----
    const handlePresenceChanged = ({ id, status }) => {
      console.log("[FriendList] presence changed:", id, status);
      setFriends((prev) =>
        prev.map((f) => {
          const friendId = f.friend?.userId || f.userId || f.id;
          if (friendId === id) {
            const updatedFriend = {
              ...f.friend,
              status,
            };
            return { ...f, friend: updatedFriend };
          }
          return f;
        })
      );
    };

    // Attach listeners
    listenFriendAccepted(handleFriendAccepted);
    listenFriendRemoved(handleFriendRemoved);
    listenPresenceChanged(handlePresenceChanged);

    // Cleanup listeners
    return () => {
      stopListenFriendAccepted(handleFriendAccepted);
      stopListenFriendRemoved(handleFriendRemoved);
      stopListenPresenceChanged(handlePresenceChanged);
    };
  }, []);

  // 🔹 Remove friend
  const handleRemoveFriend = (friendshipId) => {
    if (loadingId) return;
    setLoadingId(friendshipId);

    removeFriend(friendshipId, (res) => {
      setLoadingId(null);
      if (!res.ok) {
        toast.error(res.message || "Failed to remove friend");
      } else {
        toast.success("Friend removed successfully");
        setFriends((prev) =>
          sortFriends(prev.filter((f) => f.friendshipId !== friendshipId))
        );
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 h-20 flex items-center px-7 bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] border-b border-[#222] shadow-lg">
        <h2 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow">
          All Friendships
        </h2>
      </div>

      {/* Friend list */}
      <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-2">
        {friends.map((item) => {
          const friendUser = {
            id: item.friend?.userId || item.userId || item.id || "unknown",
            name: item.friend?.name || item.name || "Unknown User",
            status: item.friend?.status || item.status || "offline",
          };

          return (
            <UserCard
              key={item.friendshipId || item._id}
              user={friendUser}
              type="friend"
              active={(friendUser.status || "offline") === "online"} // ✅ fixed
              menu={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full hover:bg-[#222] text-gray-400 hover:text-[#00b4ff] transition">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    className="bg-[#111]/95 backdrop-blur-md border border-[#2a2a2a] text-[#cfcfcf] shadow-[0_4px_20px_rgba(0,0,0,0.7)] rounded-2xl px-1 py-2"
                  >
                    {[
                      {
                        label: "Message",
                        danger: false,
                        action: () => toast.info("Messaging soon..."),
                      },
                      {
                        label:
                          loadingId === item.friendshipId
                            ? "Removing..."
                            : "Remove Friend",
                        danger: false,
                        action: () => handleRemoveFriend(item.friendshipId),
                      },
                      {
                        label: "Block",
                        danger: true,
                        action: () => toast.info("Block feature coming soon"),
                      },
                    ].map((opt, idx, arr) => (
                      <div key={opt.label}>
                        <DropdownMenuItem
                          onClick={opt.action}
                          disabled={loadingId === item.friendshipId}
                          className={`relative cursor-pointer px-3 py-2 rounded-lg transition font-medium
                            ${
                              opt.danger
                                ? "text-red-400 hover:bg-gradient-to-r hover:from-red-400 hover:to-red-600"
                                : "text-[#cfcfcf] hover:bg-gradient-to-r hover:from-[#525151] hover:to-[#292929] hover:text-[#111]"
                            }`}
                        >
                          {opt.label}
                        </DropdownMenuItem>

                        {idx !== arr.length - 1 && (
                          <Separator className="my-2 bg-gradient-to-r from-transparent via-[#2e2e2e] to-transparent" />
                        )}
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          );
        })}

        {friends.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            You don’t have any friends yet.
          </p>
        )}
      </div>
    </div>
  );
}
