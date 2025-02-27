import Home from "./components/Home";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/dashboard"; // Ensure correct import
import Homepage from "./pages/homepage"; // Import Homepage
import { auth } from "./firebase";
import Banner from './components/banner/banner';
import Coinstable from './components/Coinstable';
import { CryptoContextProvider } from './cryptocontext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <CryptoContextProvider>
        <AppContent user={user} />
      </CryptoContextProvider>
      <ToastContainer />
    </Router>
  );
}

function AppContent({ user }) {
  const location = useLocation();
  const showHeader = location.pathname === "/Homepage"; // Only show Header on /dashboard

  return (
    <>
      {showHeader && <Header />} {/* Render Header only on /dashboard */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Banner />} />
        <Route path="/coins" element={<Coinstable />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;