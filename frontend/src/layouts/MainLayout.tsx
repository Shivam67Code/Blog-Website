import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col gradient-subtle">
      <Navbar />
      <main className="flex-1 container-responsive section min-h-[70vh]">
        <Outlet />
      </main>

      <footer className="border-t bg-white/70 backdrop-blur">
        {/* added extra bottom padding on small screens so floating button doesn't cover footer text */}
        <div className="container-responsive py-6 pb-24 sm:pb-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Blogify. All rights reserved. (Shivam Karn - Developer)</p>
          {/* <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div> */}
        </div>
      </footer>

      {/* Centered larger floating Create button
          moved slightly up on small screens (bottom-20) so it doesn't overlap footer */}
      <Link
        to="/create"
        aria-label="Create Post"
        className="fixed left-1/2 transform -translate-x-1/2 bottom-20 sm:bottom-8 z-50"
      >
        <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <Plus size={24} />
        </div>
      </Link>
    </div>
  );
};

export default MainLayout;