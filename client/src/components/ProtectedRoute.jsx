/**
 * components/ProtectedRoute.jsx
 * Redirects unauthenticated users to /login.
 * Shows a loading spinner while auth is initialising.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}
