import ConversationList from "../../components/conversation/ConversationList";

export default function Chat() {
  return (
    <div className='flex h-full bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a] p-1'>
      {" "}
      <aside className='relative flex'>
        {/* Sidebar */}
        <div className='w-90 bg-gradient-to-b from-[#121212] to-[#151515] shadow-xl p-0'>
          <ConversationList />
        </div>
      </aside>
      {/* Right content */}
      <main className='bg-[#0f0f0f] border-2 border-gray-600 rounded-2xl flex-1 overflow-y-auto'>
        chat
      </main>
    </div>
  );
}
