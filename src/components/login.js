import React, { useMemo, useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getIdTokenResult } from "firebase/auth";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import loginBg from "../assets/loginbg.jpg";
import { logAudit } from "../lib/audit";
 
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const provider = useMemo(() => {
    const p = new GoogleAuthProvider();
    p.setCustomParameters({ prompt: "select_account" });
    return p;
  }, []);

  const redirectAfterLogin = async (user) => {
    const token = await getIdTokenResult(user, true);
    const role = token.claims.role || "user";

    if (role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/profile";
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await logAudit("auth_sign_in_email");
      toast.success("Logged in successfully!", { position: "top-center" });
      await redirectAfterLogin(result.user);
    } catch (err) {
      toast.error(err.message, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await getIdTokenResult(result.user, true);
      const role = token?.claims?.role || null;

      // Only log as admin if role is explicitly "admin"
      if (role === "admin") {
        await logAudit("auth_sign_in_admin_google");
        window.location.href = "/admin";
      } else {
        // Regular user - log as regular sign in
        await logAudit("auth_sign_in_google");
        window.location.href = "/profile";
      }
    } catch (err) {
      toast.error(err.message, { position: "bottom-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-slate-950 text-white relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.95), rgba(8,47,73,.8)), url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-teal-900/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />

      <form
        onSubmit={handleEmailLogin}
        className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/20 p-10 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/50"
        >
          {loading ? "Logging in..." : "Sign In"}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900/90 text-slate-400">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition mb-3 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-4 bg-slate-800/50 border border-slate-700 text-white rounded-xl font-semibold hover:bg-slate-800/70 transition disabled:opacity-60"
        >
          Login as Admin
        </button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{" "}
          <a href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}

export default Login;
