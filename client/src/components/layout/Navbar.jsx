import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isLogin = location.pathname === "/auth/login";
  const isRegister = location.pathname === "/auth/register";

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 w-full z-50",
          "backdrop-blur-xl bg-[#0d0d0d]/70",
          "shadow-xl"
        )}
      >
        {/* Silver Gradient Border */}
        <div className='absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#4a4a4a] via-[#8f8f8f] to-[#4a4a4a]' />

        <div className='max-w-7xl mx-auto px-8 py-5 flex items-center justify-between'>
          {/* Brand */}
          <h1
            className='text-4xl font-extrabold tracking-widest bg-gradient-to-r 
            from-[#d4d4d4] to-[#8f8f8f] bg-clip-text text-transparent
            drop-shadow-md'
          >
            L<span className='text-[#00b4ff]'>y</span>nk
          </h1>

          {/* Nav Links */}
          <div className='hidden md:flex items-center space-x-6'>
            <a
              href='#about'
              className='text-[#bfbfbf] hover:text-[#e5e5e5] text-lg transition-colors'
            >
              About
            </a>

            {/* Login Button */}
            <Link to='/auth/login'>
              <Button
                variant='outline'
                className={cn(
                  "border border-[#8f8f8f] rounded-xl px-6 py-2 shadow-md transition-colors",
                  isLogin
                    ? "bg-white hover:bg-[#e0e0e0] text-black font-semibold"
                    : "bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2e2e2e] hover:text-white"
                )}
              >
                Login
              </Button>
            </Link>

            {/* Register Button */}
            <Link to='/auth/register'>
              <Button
                variant='default'
                className={cn(
                  "border border-[#8f8f8f] rounded-xl px-6 py-2 shadow-md transition-colors",
                  isRegister
                    ? "bg-white hover:bg-[#e0e0e0] text-black font-semibold"
                    : "bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2e2e2e] hover:text-white"
                )}
              >
                Register
              </Button>
            </Link>
          </div>
        </div>
      </nav>
      {/* Push content below navbar */}
      <div className='h-[84px]' />
    </>
  );
}
