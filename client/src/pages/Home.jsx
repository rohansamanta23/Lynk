export default function Home() {
  return (
    <div className='min-h-screen min-w-[99vw] max-w-screen bg-gradient-to-br from-zinc-800 via-black to-zinc-700 flex flex-col items-center justify-center text-white px-3 sm:px-6'>
      {/* Hero Section */}
      <section className='text-center max-w-3xl'>
        <h1 className='text-4xl sm:text-6xl font-extrabold mb-6'>
          <span className='text-sky-400'>Lynk</span>
        </h1>
        <p className='text-gray-400 text-base sm:text-lg mb-10'>
          The modern way to connect, chat, and share with friends. Simple, fast,
          and secure messaging built for you.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
          <a
            href='/auth/register'
            className='px-6 sm:px-8 py-3 rounded-xl bg-sky-500 text-black font-semibold hover:bg-sky-400 transition text-base sm:text-lg w-full sm:w-auto'
          >
            Get Started
          </a>
          <a
            href='/auth/login'
            className='px-6 sm:px-8 py-3 rounded-xl border border-gray-600 hover:bg-gray-800 transition text-base sm:text-lg w-full sm:w-auto'
          >
            Login
          </a>
        </div>
      </section>

      {/* Sub Info */}
      <section className='mt-16 sm:mt-24 text-center max-w-2xl'>
        <h2 className='text-xl sm:text-2xl font-semibold mb-4'>Why Lynk?</h2>
        <p className='text-gray-400 text-base sm:text-lg'>
          Stay connected with your friends and communities in a clean,
          distraction-free environment. Whether you’re sharing ideas or just
          hanging out, Lynk keeps conversations flowing.
        </p>
      </section>
    </div>
  );
}
