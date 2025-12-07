import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export function AdminRoute({ children }) {
  const [state, setState] = useState({ loading: true, allow: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setState({ loading: false, allow: false });
        return;
      }

      try {
        const token = await getIdTokenResult(u, true);
        const role = token?.claims?.role || null;
        const isAdmin = role === "admin";
        
        setState({ loading: false, allow: isAdmin });
      } catch (error) {
        console.error("Error checking admin role:", error);
        setState({ loading: false, allow: false });
      }
    });

    return unsub;
  }, []);

  // Show loading state while checking
  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Checking permissions...</div>
      </div>
    );
  }

  // Redirect non-admins immediately
  if (!state.allow) {
    return <Navigate to="/profile" replace />;
  }

  // Only render children if user is admin
  return children;
}
