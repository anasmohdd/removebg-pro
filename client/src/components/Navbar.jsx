/**
 * components/Navbar.jsx
 * Top navigation bar with logo, credits badge, and logout.
 */

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CreditBadge({ credits }) {
  const color =
    credits === 0
      ? "bg-rose-50 text-rose-600 border-rose-200"
      : credits <= 2
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : "bg-emerald-50 text-emerald-600 border-emerald-200";

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${color}`}>
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12zm.75-8.25h-1.5v3.5l2.75 1.65.75-1.25-2-1.2V7.75z" />
      </svg>
      {credits} credit{credits !== 1 ? "s" : ""} left
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-display font-700 text-lg tracking-tight text-slate-800 group-hover:text-brand-600 transition-colors">
            RemoveBG<span className="text-brand-500"> Pro</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <CreditBadge credits={user.credits} />

              {/* User avatar */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  {user.name.split(" ")[0]}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 transition-colors font-medium px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
