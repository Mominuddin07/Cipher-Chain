import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import registerBg from "../assets/registerbg.jpg"; // Add your background image

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
    <form
      onSubmit={handleRegister}
      className="flex items-center justify-center min-h-screen"
      style={{
        backgroundImage: `url(${registerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div
        className="p-8 rounded-lg shadow-lg w-full max-w-md"
        style={{
          background: "rgba(255, 255, 255, 0.2)", // Transparent white
          backdropFilter: "blur(10px)", // Glass effect
          border: "1px solid rgba(255, 255, 255, 0.3)", // Soft border
        }}
      >
        <h3 className="text-2xl font-bold text-center mb-6 text-white">
          Sign Up
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-white mb-2">
            First name
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg bg-transparent text-white placeholder-gray-300"
            placeholder="First name"
            onChange={(e) => setFname(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-white mb-2">
            Last name
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg bg-transparent text-white placeholder-gray-300"
            placeholder="Last name"
            onChange={(e) => setLname(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-white mb-2">
            Email address
          </label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg bg-transparent text-white placeholder-gray-300"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
            required
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
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Sign Up
          </button>
        </div>

        <p className="text-center text-sm text-white">
          Already registered?{" "}
          <a href="/login" className="text-blue-300 hover:text-blue-500">
            Login
          </a>
        </p>
      </div>
    </form>
  );
}

export default Register;
