import { useState, useRef, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchUsers } from "@/api/friendshipApi";
import { sendFriendRequest } from "../../socket/events/friendship.js";
import UserCard from "./UserCard";
import { toast } from "sonner";

export default function FriendshipSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef();

  const handleSearch = async (searchQuery) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const users = await searchUsers(searchQuery);
      // reset any old sending state
      setResults(users.map(u => ({ ...u, sending: false })));
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 1000); // 1000ms debounce
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSendRequest = (user) => {
    // mark sending
    setResults(prev =>
      prev.map(u => u._id === user._id ? { ...u, sending: true } : u)
    );

    sendFriendRequest(user.userId, (res) => {
      if (res?.ok) {
        toast.success("Friend request sent!");
        // optionally remove user from results after success
        setResults(prev => prev.filter(u => u._id !== user._id));
      } else {
        toast.error(res?.message || "Failed to send request.");
        // reset sending state on failure
        setResults(prev =>
          prev.map(u => u._id === user._id ? { ...u, sending: false } : u)
        );
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className='mb-6 h-20 flex items-center px-7 bg-gradient-to-r from-[#0f0f0f] via-[#111] to-[#1b1b1b] border-b border-[#222] shadow-lg'>
        <h2 className='text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00b4ff] to-[#0077ff] bg-clip-text text-transparent drop-shadow'>
          Send Friend Request
        </h2>
      </div>

      {/* Search bar */}
      <div className='flex items-center gap-3 mb-6 px-2'>
        <div className='flex items-center bg-[#151515] border border-[#222] rounded-xl px-4 w-full h-10 focus-within:border-gray-100/50 focus-within:shadow-[0_0_8px_#555] transition'>
          <Search className='text-gray-500 mr-2' size={20} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch(query);
              }
            }}
            placeholder='Search by U.ID...'
            className='bg-transparent border-0 focus-visible:ring-0 text-[#e5e5e5] placeholder:text-gray-500'
            autoComplete='off'
          />
        </div>
        <Button
          onClick={() => handleSearch(query)}
          className='bg-gradient-to-r from-[#00b4ff] to-[#0077ff] text-white text-md h-10 px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition hover:scale-102'
        >
          Search
        </Button>
      </div>

      {/* Results */}
      {loading && <p className='text-center text-gray-500 mt-10'>Loading...</p>}
      {!loading &&
        results.length > 0 &&
        results.map((user) => (
          <div key={user._id} className='mb-3'>
            <UserCard
              user={user}
              type='search'
              actions={
                <Button
                  disabled={user.sending}
                  className={`flex items-center gap-2 px-4 py-1 text-sm font-semibold rounded-xl
                    bg-gradient-to-r from-[#c0c0c0] via-[#e0e0e0] to-[#a0a0a0] text-[#222]
                    border-2 border-gray-600 transition
                    ${user.sending ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  onClick={() => handleSendRequest(user)}
                >
                  {user.sending ? "Sending..." : <><UserPlus size={18} /> Send Request</>}
                </Button>
              }
            />
          </div>
        ))}
      {!loading && results.length === 0 && query && (
        <p className='text-center text-gray-500 mt-10'>No user found</p>
      )}
    </div>
  );
}
