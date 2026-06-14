import { Outlet } from "react-router-dom";
import { useState } from "react";
import SystemSidebar from "../systemAdmin/SystemSidebar";
import Navbar from "./Navbar";

export default function SystemAdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SystemSidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
