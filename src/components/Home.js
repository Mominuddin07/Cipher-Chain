import React, { useRef, useState, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";

import stocktrends from "../assets/stocktrends.jpg";
import sensex from "../assets/sensex.jpg";
import cryptocoins from "../assets/cryptocoins.jpg";

import RealTimeAnalytics from "../assets/RealTimeAnalytics.jpg";
import MarketInsights from "../assets/MarketInsights.jpg";
import RiskAssessment from "../assets/RiskAssessment.jpg";

function Home() {
  const navigate = useNavigate();
  const formRef = useRef();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const scrollToSection = useCallback((id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLoading(true);

      if (!form.name || !form.email || !form.message) {
        alert("Please fill in all fields.");
        setLoading(false);
        return;
      }

      emailjs
        .send(
          process.env.REACT_APP_SERVICE_API,
          process.env.REACT_APP_TEMPLATE_API,
          {
            from_name: form.name,
            to_name: "Cipher Chain Support",
            from_email: form.email,
            to_email: "support@cipherchain.com",
            message: form.message,
          },
          process.env.REACT_APP_EMAILJS_API
        )
        .then(
          () => {
            alert("Thank you! Our team will contact you shortly.");
            setForm({ name: "", email: "", message: "" });
            setLoading(false);
          },
          (error) => {
            console.error(error);
            alert("Something went wrong. Try again.");
            setLoading(false);
          }
        );
    },
    [form]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900">
      {/* NAVBAR */}
      <header className="bg-slate-900/80 backdrop-blur-xl text-white fixed w-full z-50 shadow-lg border-b border-white/10">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <a className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent" href="/">
            Cipher Chain
          </a>
          <ul className="flex space-x-8">
            <li>
              <button onClick={() => scrollToSection("features")} className="hover:text-cyan-400 transition">
                Features
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("insights")} className="hover:text-cyan-400 transition">
                Insights
              </button>
            </li>
            <li>
              <button onClick={() => scrollToSection("contact")} className="hover:text-cyan-400 transition">
                Contact
              </button>
            </li>
            <li>
              <a
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 font-semibold"
              >
                Register
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://iea.imgix.net/fd158318-41d2-4c89-8367-d194aa7b2def/WorldEnergyInvestment2024-shutterstock_2333511041.jpg?auto=compress&fit=min&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80" />

        <div className="relative bg-slate-900/60 backdrop-blur-xl p-10 rounded-3xl border border-white/20 shadow-2xl text-center max-w-3xl">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            A Secure Platform for Crypto Intelligence & User Management
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Experience real-time crypto analytics backed by secure authentication,
            role-based access control, and complete activity audit logging.
          </p>

          <button
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition shadow-cyan-500/50 text-lg"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Platform Capabilities
        </h2>
        <p className="text-gray-400 mb-12">
          Enterprise features designed for secure and scalable crypto intelligence.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-4">
          {/* Secure Auth */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <img src={RealTimeAnalytics} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="text-xl font-semibold text-white">Secure Authentication</h4>
            <p className="text-gray-400 mt-2">
              Google SSO and Email/Password login using Firebase Authentication with strong session security.
            </p>
          </div>

          {/* RBAC */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <img src={MarketInsights} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="text-xl font-semibold text-white">Role-Based Access Control (RBAC)</h4>
            <p className="text-gray-400 mt-2">
              Admins and users have separate permissions enforced through Firebase custom claims and secure routing.
            </p>
          </div>

          {/* Audit Logs */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <img src={RiskAssessment} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="text-xl font-semibold text-white">Admin Monitoring & Audit Logging</h4>
            <p className="text-gray-400 mt-2">
              Track all logins, logouts, and admin actions in real-time for transparency, security, and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* INSIGHTS SECTION */}
      <section id="insights" className="py-20 text-center bg-gradient-to-b from-slate-950 to-slate-900">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Investment Insights
        </h2>
        <p className="text-gray-400 mb-12">
          Access real-time crypto trends and market performance data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 container mx-auto px-4">
          {/* Crypto Market Overview */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <img src={cryptocoins} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="text-xl font-semibold text-white">Crypto Market Overview</h4>
            <p className="text-gray-400 mt-2">
              View real-time updates on major cryptocurrencies, price movements, and market trends.
            </p>
          </div>

          {/* Real-time Dashboard */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <img src={sensex} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="text-xl font-semibold text-white">Real-Time Dashboard</h4>
            <p className="text-gray-400 mt-2">
              Explore live index performance including SENSEX, NASDAQ, NIFTY and S&P500 with dynamic analytics.
            </p>
          </div>

          {/* User & Admin Operations */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <img src={stocktrends} alt="" className="w-full h-48 object-cover rounded-xl mb-4" />
            <h4 className="text-xl font-semibold text-white">User & Admin Workflows</h4>
            <p className="text-gray-400 mt-2">
              Users access personalized dashboards while administrators manage accounts and monitor system activity.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 text-center">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Contact Us
        </h2>
        <p className="text-gray-400 mb-8">
          Have questions about authentication, RBAC, audit logging, or crypto analytics? We’re here to help.
        </p>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-8 container mx-auto max-w-2xl">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white"
              value={form.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              rows="5"
              placeholder="Your Message"
              className="w-full p-4 border border-white/20 rounded-xl bg-white/10 text-white resize-none"
              value={form.message}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-semibold hover:from-cyan-600 hover:to-blue-600 transition"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-slate-950 text-gray-400 py-8 border-t border-white/10 text-center">
        © 2025 Cipher Chain — Enterprise Crypto Intelligence Platform
      </footer>
    </div>
  );
}

export default Home;
