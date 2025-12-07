import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const ALLOWED = new Set([
  "auth_sign_in",
  "auth_sign_in_email",
  "auth_sign_in_google",
  "auth_sign_in_admin_google",
  "auth_sign_up_email",
  "auth_sign_out",
  "admin_create_coin",
  "admin_update_coin",
  "admin_delete_coin",
  "admin_create_banner",
  "admin_update_banner",
  "admin_delete_banner",
]);

export async function logAudit(action, target = null, meta = null) {
  if (!auth.currentUser) return;
  if (!ALLOWED.has(action)) return;

  const u = auth.currentUser;
  const email = u.email || null;
  
  try {
    // Force refresh token to get latest custom claims
    const token = await u.getIdTokenResult(true);
    
    // Get role from token claims - explicitly check for "admin"
    const rawRole = token?.claims?.role;
    
    // Only set as "admin" if explicitly "admin", otherwise default to "user"
    // This handles: undefined, null, "", or any other value
    const role = (rawRole === "admin") ? "admin" : "user";
    
    // Debug logging (remove in production if needed)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Audit] User: ${email}, Raw Role: ${rawRole}, Final Role: ${role}, Action: ${action}`);
    }

    await addDoc(collection(db, "auditLogs"), {
      ts: serverTimestamp(),
      action,
      actor: { uid: u.uid, email, role },
      target: target || null,
      meta: meta || null,
    });
  } catch (e) {
    console.warn("Audit log failed:", e.message);
  }
}
