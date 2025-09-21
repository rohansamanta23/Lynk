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
          {/* Brand with Logo */}
          <Link to='/' className='flex items-center space-x-3'>
            <img
              src={"/assets/lynk_logo.png"}
              alt='Lynk Logo'
              className='w-10 h-10 object-contain drop-shadow-md'
              style={{ marginRight: "0.5rem" }}
            />
            <h1
              className='text-3xl font-extrabold tracking-widest bg-gradient-to-r 
              from-[#d4d4d4] to-[#8f8f8f] bg-clip-text text-transparent
              drop-shadow-md cursor-pointer pb-1'
            >
              L<span className='text-[#00b4ff]'>y</span>nk
            </h1>
          </Link>

          {/* Nav Links - Desktop */}
          <div className='hidden md:flex items-center space-x-6'>
            <a
              href='https://github.com/rohansamanta23'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#bfbfbf] hover:text-[#e5e5e5] text-lg transition-colors'
            >
              About
            </a>
            <Link to='/auth/login'>
              <Button
                variant='outline'
                className={cn(
                  "border border-[#8f8f8f] rounded-xl px-6 py-2 shadow-md transition-colors font-semibold",
                  isLogin
                    ? "bg-gradient-to-r from-[#d4d4d4] via-[#bfbfbf] to-[#8f8f8f] text-black ring-2 ring-[#bfbfbf]"
                    : "bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2e2e2e] hover:text-white"
                )}
              >
                Login
              </Button>
            </Link>
            <Link to='/auth/register'>
              <Button
                variant='default'
                className={cn(
                  "border border-[#8f8f8f] rounded-xl px-6 py-2 shadow-md transition-colors font-semibold",
                  isRegister
                    ? "bg-gradient-to-r from-[#d4d4d4] via-[#bfbfbf] to-[#8f8f8f] text-black ring-2 ring-[#bfbfbf]"
                    : "bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2e2e2e] hover:text-white"
                )}
              >
                Register
              </Button>
            </Link>
          </div>

          {/* Nav Links - Mobile */}
          <div className='flex flex-col items-end space-y-2 md:hidden'>
            <div className='flex space-x-2'>
              <Link to='/auth/login'>
                <Button
                  variant='outline'
                  className={cn(
                    "border border-[#8f8f8f] rounded-xl px-4 py-2 shadow-md transition-colors font-semibold text-sm",
                    isLogin
                      ? "bg-gradient-to-r from-[#d4d4d4] via-[#bfbfbf] to-[#8f8f8f] text-black ring-2 ring-[#bfbfbf]"
                      : "bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2e2e2e] hover:text-white"
                  )}
                >
                  Login
                </Button>
              </Link>
              <Link to='/auth/register'>
                <Button
                  variant='default'
                  className={cn(
                    "border border-[#8f8f8f] rounded-xl px-4 py-2 shadow-md transition-colors font-semibold text-sm",
                    isRegister
                      ? "bg-gradient-to-r from-[#d4d4d4] via-[#bfbfbf] to-[#8f8f8f] text-black ring-2 ring-[#bfbfbf]"
                      : "bg-[#1f1f1f] text-[#d4d4d4] hover:bg-[#2e2e2e] hover:text-white"
                  )}
                >
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Push content below navbar */}
      <div className='h-[84px]' />
    </>
  );
}
