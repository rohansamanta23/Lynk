import UserCard from "./UserCard";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBlockList } from "@/api/friendshipApi.js";
import { useEffect, useState } from "react";

export default function BlockList() {
  const [blocked, setBlocked] = useState([]);
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const data = await getBlockList();
        setBlocked(Array.isArray(data) ? data : []);
      } catch (err) {
        setBlocked([]);
      }
    };
    fetchBlockedUsers();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className='mb-6 h-20 flex items-center px-7 bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] border-b border-[#222] shadow-lg'>
        <h2 className='text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow'>
          Blocked Users
        </h2>
      </div>

      {/* Blocked list */}
      <div className='space-y-3 max-h-[80vh] overflow-y-auto pr-2'>
        {blocked.length === 0 ? (
          <div className='text-center text-gray-400 py-8'>
            No blocked users.
          </div>
        ) : (
          blocked.map((item) => (
            <UserCard
              key={item.friendshipId}
              user={{
                id: item.user?.userId || item.userId || item.id || "?",
                name: item.user?.name || item.name || "",
                status: item.user?.status || item.status || "offline",
              }}
              type='blocked'
              active={"offline"}
              menu={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='p-2 rounded-full hover:bg-[#222] text-gray-400 hover:text-red-400 transition'>
                      <MoreVertical className='h-5 w-5' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align='end'
                    className='bg-[#111]/95 backdrop-blur-md border border-[#2a2a2a] text-[#cfcfcf] rounded-2xl px-1 py-2'
                  >
                    <DropdownMenuItem className='hover:text-transparent bg-clip-text hover:bg-gradient-to-r hover:from-[#00b4ff] hover:to-[#0077ff] font-medium cursor-pointer'>
                      Unblock
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
