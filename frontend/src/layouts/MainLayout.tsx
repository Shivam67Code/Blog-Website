import { Outlet, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col gradient-subtle">
      <Navbar />
      <main className="flex-1 container-responsive section min-h-[70vh]">
        <Outlet />
        {children}
      </main>
      <footer className="border-t bg-white/70 backdrop-blur">
        <div className="container-responsive py-6 text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Blogify. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>

      {/* Floating Create Post button (visible on all pages) */}
      <Link to="/create" aria-label="Create Post" className="floating-create-btn">
        <Plus size={16} />
        <span className="hidden sm:inline">Create</span>
      </Link>
    </div>
  );
}