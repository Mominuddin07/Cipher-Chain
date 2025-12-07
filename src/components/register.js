import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import registerBg from "../assets/registerbg.jpg";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;  

      if (user) {
        await setDoc(doc(db, "Users", user.uid), { 
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: "",
        });
      }

      console.log("User Registered Successfully!!");
      toast.success("User Registered Successfully!!", { position: "top-center" });

    } catch (error) {
      console.log(error.message);
      toast.error(error.message, { position: "bottom-center" });
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15,23,42,.95), rgba(8,47,73,.8)), url(${registerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-teal-900/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />

      <form
        onSubmit={handleRegister}
        className="relative p-10 rounded-3xl shadow-2xl w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/20"
      >
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Create Account
          </h3>
          <p className="text-slate-400">Join InvestSmart today</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              First name
            </label>
            <input
              type="text"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Enter first name"
              onChange={(e) => setFname(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Last name
            </label>
            <input
              type="text"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Enter last name"
              onChange={(e) => setLname(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email address
            </label>
            <input
              type="email"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              placeholder="Create a password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition font-semibold shadow-lg shadow-cyan-500/50"
          >
            Sign Up
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-white">
          Already have an account?{" "}
          <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
