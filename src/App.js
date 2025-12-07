import Home from "./components/Home";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import Login from "./components/login";
import SignUp from "./components/register";
import Profile from "./components/dashboard"; // Ensure correct import
import Homepage from "./pages/homepage"; // Import Homepage
import AdminDashboard from "./components/Admin/AdminDashboard"; // Import AdminDashboard
import { auth } from "./firebase";
import Banner from './components/banner/banner';
import Coinstable from './components/Coinstable';
import { CryptoContextProvider } from './cryptocontext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import { AdminRoute } from "./routes/AdminRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";

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
  const showHeader = location.pathname === "/homepage"; // Show Header on /homepage

  return (
    <>
      {showHeader && <Header />} {/* Render Header on /homepage */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/homepage" 
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Banner />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/coins" 
          element={
            <ProtectedRoute>
              <Coinstable />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Route */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to={user ? "/profile" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;