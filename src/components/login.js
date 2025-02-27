import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth } from "../firebase";
import { toast } from "react-toastify";
import login from "../assets/loginbg.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      window.location.href = "/profile";
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      console.log(error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${login})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div
        className="p-8 rounded-lg shadow-lg w-full max-w-md"
        style={{
          background: "rgba(255, 255, 255, 0.2)", // Fully transparent white
          backdropFilter: "blur(10px)", // Adds blur effect for a glassmorphic look
          border: "1px solid rgba(255, 255, 255, 0.3)", // Light border for definition
        }}
      >
        <h3 className="text-2xl font-bold text-center mb-6 text-white">
          Login
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-white mb-2">
            Email address
          </label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg bg-transparent text-white placeholder-gray-300"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-white mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full p-3 border border-gray-300 rounded-lg bg-transparent text-white placeholder-gray-300"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Submit
          </button>
        </div>

        <p className="text-center text-sm text-white">
          New user?{" "}
          <a href="/register" className="text-blue-300 hover:text-blue-500">
            Register Here
          </a>
        </p>
      </div>
    </form>
  );
}

export default Login;
