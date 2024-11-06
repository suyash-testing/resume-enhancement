"use client";
import Link from "next/link";
import { CircleUser, FileUser, Menu, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

export default function Dashboard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage?.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear("token");
    router.push("/");
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[250px_1fr] lg:grid-cols-[300px_1fr] bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Sidebar */}
      <div className="hidden border-r  bg-white  text-black shadow-xl md:block">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-16 items-center border-b  px-6 lg:h-[70px]">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-black"
            >
              <Image src="/logopng.png" width={50} height={10} alt="logo" />
            </Link>
          </div>
          {/* Desktop Sidebar Navigation */}
          <div className="flex-1 mt-4">
            <nav className="flex flex-col items-start gap-4 px-6">
              <Link
                href="/resume-rewrite"
                className={`flex items-center gap-3 rounded-lg px-3 py-3 w-full transition-colors ${
                  pathname === "/resume-rewrite"
                    ? "bg-blue-100"
                    : "hover:bg-blue-100"
                }`}
              >
                <FileUser className="h-5 w-5 text-black" />
                <span className="text-md">Resume Rewrite</span>
              </Link>
              <Link
                href="/ats"
                className={`flex items-center gap-3 rounded-lg px-3 py-3 w-full transition-colors ${
                  pathname === "/ats" ? "bg-blue-100" : "hover:bg-blue-100"
                }`}
              >
                <ScanSearch className="h-5 w-5 text-black" />
                <span className="text-md">ATS</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-white shadow-md px-6 lg:h-[70px]">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col bg-white shadow-lg"
            >
              <nav className="grid gap-3 text-lg font-medium px-4 py-4">
                <Link href="/" className="text-xl font-bold text-gray-700">
                  Vlink
                </Link>
                <Link
                  href="/resume-rewrite"
                  className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-gray-100  transition"
                >
                  <FileUser className="h-5 w-5" />
                  Resume Rewrite
                </Link>
                <Link
                  href="/ats"
                  className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-gray-100  transition"
                >
                  <ScanSearch className="h-5 w-5" />
                  ATS
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1"></div>
          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white text-black "
              >
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white shadow-lg rounded-lg"
            >
              <DropdownMenuItem
                onClick={handleLogout}
                className="hover:bg-red-100 hover:text-red-500 transition font-medium text-red-500"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 px-6 lg:gap-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </main>
        <ToastContainer />
      </div>
    </div>
  );
}
