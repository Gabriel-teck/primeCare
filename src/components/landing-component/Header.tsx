"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [showNavBar, setShowNavBar] = useState(false);

  return (
    <>
      <nav className="fixed top-0 z-50 flex w-full h-16 md:h-28 items-center justify-between bg-white dark:bg-accent  border-b shadow-sm px-4 md:px-6 ">
        {/* logo */}
        <div className="flex text-shadow-lg">
          <Link href="/">
            <span className="text-xl md:text-2xl font-bold">prime</span>
            <span className="text-2xl md:text-3xl font-extrabold text-green-700">
              Care
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 text-lg font-bold">
          <Link
            href="/"
            className="text-gray-600 hover:text-green-600 transition-colors hover:bg-gray-100 rounded-md px-4 py-2"
          >
            Home
          </Link>
          <Link
            href="#2"
            className="text-gray-600 hover:text-green-600 transition-colors hover:bg-gray-100 rounded-md px-4 py-2"
          >
            Care Service
          </Link>
          <Link
            href="#3"
            className="text-gray-600 hover:text-green-600 transition-colors hover:bg-gray-100 rounded-md px-4 py-2"
          >
            Consultation
          </Link>
          <Link
            href="#4"
            className="text-gray-600 hover:text-green-600 transition-colors hover:bg-gray-100 rounded-md px-4 py-2"
          >
            About us
          </Link>
          <Link
            href="#5"
            className="text-gtext-green-600 transition-colors hover:bg-gray-100 rounded-md px-6 py-2"
          >
            Contact us
          </Link>
          <Link
            href="/login"
            className="text-gray-600 hover:text-green-600 transition-colors rounded-md shadow-sm  bg-gray-100 px-6 py-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hover:bg-gray-100 hover:text-green-700 transition-colors rounded-md shadow-sm text-white bg-[#1d884a] px-6 py-2"
          >
            Signup
          </Link>
          {/* Only authenticated user should have access */}
          <Button variant="ghost" size="sm" onClick={() => toggleTheme()}>
            {theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowNavBar(!showNavBar)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {showNavBar ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {showNavBar && (
        <>
          <div
            className={`fixed top-16 left-0 right-0 z-50 md:hidden
          h-[calc(100vh-4rem)] overflow-y-auto
          transition-transform duration-700 ease-in-out
          ${showNavBar ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="flex flex-col font-bold py-4 px-6 space-y-4 bg-white dark:bg-cyan-950 dark:text-white shadow-md items-center border-2">
              <Link
                href="#1"
                className="text-lg py-2 hover:text-green-600 transition-colors"
              >
                Home
              </Link>
              <Link
                href="#2"
                className="text-lg py-2 hover:text-green-600 transition-colors"
              >
                Care Service
              </Link>
              <Link
                href="#3"
                className="text-lg py-2 hover:text-green-600 transition-colors"
              >
                Consultation
              </Link>
              <Link
                href="#4"
                className="text-lg py-2 hover:text-green-600 transition-colors"
              >
                About us
              </Link>
              <Link
                href="#5"
                className="text-lg py-2 hover:text-green-600 transition-colors"
              >
                Contact us
              </Link>
              <div className="flex justify-evenly pt-4 border-t w-full items-center">
                <Link
                  href="/login"
                  className="text-lg py-2 px-8 text-green-600 hover:text-green-600 transition-colors rounded-md shadow-sm  bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-lg py-2 px-8 bg-[#1d884a] hover:text-green-800 transition-colors rounded-md shadow-sm text-white hover:bg-[#95efbaf8]"
                >
                  Signup
                </Link>
                <button
                  onClick={() => toggleTheme()}
                  className="border bg-green-700  dark:bg-white px-4 py-2 rounded-sm shadow-sm"
                >
                  {theme === "light" ? (
                    <Sun className=" text-white dark:text-black h-6 w-6" />
                  ) : (
                    <Moon className=" text-black h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
