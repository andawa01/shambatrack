import { Outlet } from "react-router-dom";
import { useState } from "react";
import FarmerNavbar from "./FarmerNavbar";
import FarmerSidebar from "./FarmerSidebar";

const FarmerLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <FarmerSidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Navbar */}
        <FarmerNavbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout;
