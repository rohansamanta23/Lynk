export default function NotFound() {
  return (
    <div className='min-h-screen min-w-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 flex flex-col items-center justify-center text-white px-3 sm:px-6 relative overflow-hidden'>
      {/* Background Accents */}
      <div className='absolute top-20 left-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl'></div>
      <div className='absolute bottom-24 right-20 w-72 h-72 bg-gray-500/10 rounded-full blur-3xl'></div>

      {/* 404 Title */}
      <h1 className='text-6xl sm:text-[8rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-gray-400 drop-shadow-lg select-none'>
        404
      </h1>

      {/* Subtitle */}
      <h2 className='text-lg sm:text-2xl font-semibold text-gray-300 mb-3'>
        Page Not Found
      </h2>

      {/* Description */}
      <p className='text-gray-500 max-w-md text-center text-xs sm:text-sm tracking-wide'>
        The page you are looking for doesn’t exist. It may have been moved or
        removed.
      </p>

      {/* Decorative Footer Text */}
      <p className='mt-10 sm:mt-16 text-gray-600 text-xs tracking-[0.3em] uppercase'>
        Error  Not Found
      </p>
    </div>
  );
}
