import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, allow: false });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setState({ loading: false, allow: !!u });
    });
    return unsub;
  }, []);

  if (state.loading) return null;
  return state.allow ? children : <Navigate to="/login" replace />;
}
