import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import CoopNavbar from "./CoopNavbar";

export default function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* FIXED: Changed isOpen to isMenuOpen to match your Sidebar's parameters */}
      <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main wrapper */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto lg:pl-64">
        {/* FIXED: Changed isOpen to isMenuOpen to match your CoopNavbar's parameters */}
        <CoopNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
