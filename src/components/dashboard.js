import React, { useEffect, useRef, useState } from "react";
import { FaChartLine, FaCoins, FaSignOutAlt, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Importing useNavigate

let tvScriptLoadingPromise;

export default function Dashboard() {
  const onLoadScriptRef = useRef();
  const [nifty, setNifty] = useState({ value: 18000, change: 0 });  // Set initial value for NIFTY
  const [sensex, setSensex] = useState({ value: 60000, change: 0 });  // Set initial value for SENSEX
  const navigate = useNavigate(); // Hook to navigate between pages

  useEffect(() => {
    onLoadScriptRef.current = createWidget;
    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    tvScriptLoadingPromise.then(() => onLoadScriptRef.current && onLoadScriptRef.current());
    return () => (onLoadScriptRef.current = null);

    function createWidget() {
      if (document.getElementById("tradingview_chart") && "TradingView" in window) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "NASDAQ:AAPL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          studies: ["STD;SMA", "STD;MACD", "STD;RSI"],
          container_id: "tradingview_chart",
        });
      }
    }
  }, []);

  useEffect(() => {
    const generateRandomValue = (currentValue, min, max) => {
      let randomChange = Math.random() * 1000 - 500; // Random change between -500 and 500
      let newValue = currentValue + randomChange; // Increment or decrement the value based on random change
      newValue = Math.max(min, Math.min(newValue, max)); // Ensure the value stays within the range
      return newValue;
    };

    const updateMarketData = () => {
      const newNifty = generateRandomValue(nifty.value, 15000, 20000); // NIFTY range: 15000 to 20000
      const newSensex = generateRandomValue(sensex.value, 55000, 65000); // SENSEX range: 55000 to 65000

      // Calculate profit/loss points for NIFTY
      const niftyChange = newNifty - nifty.value;
      setNifty({ value: newNifty, change: niftyChange });

      // Calculate profit/loss points for SENSEX
      const sensexChange = newSensex - sensex.value;
      setSensex({ value: newSensex, change: sensexChange });
    };

    const interval = setInterval(updateMarketData, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [nifty.value, sensex.value]);

  const handleNavigate = () => {
    navigate("/Homepage"); // Replace '/app' with the route for your app
  };

  const handleLogout = () => {
    // Clear any authentication data (e.g., tokens, user data from localStorage or sessionStorage)
    localStorage.removeItem("user"); // If you're storing user info in localStorage
    sessionStorage.removeItem("user"); // If you're storing in sessionStorage
    
    // Optionally, reset any context/state (if you're using a context to manage the user state)
    // For example, if you're using a context for user data:
    // setUser(null);

    // Redirect to the login page after logging out
    navigate("/login"); // Redirecting to the login page
  };

  return (
    <>
      <div className="flex h-screen bg-black text-white">
        <div className="w-1/5 p-6 bg-gradient-to-b from-[#111827] to-black flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <nav className="flex flex-col gap-4">
            <button className="flex items-center gap-2 p-3 bg-green-700 rounded-lg text-white">
              <FaHome /> Dashboard
            </button>
            <button
              onClick={handleNavigate}
              className="flex items-center gap-2 p-3 hover:bg-green-700 rounded-lg"
            >
              <FaCoins /> InvestSmart
            </button>
            <button
              onClick={() =>
                (window.location.href =
                  "https://thenewscrypto.com/?gad_source=1&gclid=Cj0KCQiAq-u9BhCjARIsANLj-s07izLWkv_ry5NQmwtV4ZDM4iXsNd3czR_v8T36a7vejJ8WMUZg0WsaAr8PEALw_wcB")
              }
              className="flex items-center gap-2 p-3 hover:bg-green-700 rounded-lg"
            >
              <FaChartLine /> News
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-3 hover:bg-red-700 rounded-lg"
            >
              <FaSignOutAlt /> Logout
            </button>
          </nav>
        </div>
        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">InvestSmart</h2>
            <p>Crypto coin insights provide real-time data on price movements, market trends</p>
            <button
              onClick={handleNavigate} // This will navigate to the '/app' route
              className="mt-4 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Insights
            </button>
          </div>
          <div className="p-6 bg-gray-900 shadow-lg rounded-lg text-white">
            <h2 className="text-xl font-bold mb-4">Market Indices</h2>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-400">NIFTY 50</p>
                <p className="text-2xl font-bold">{nifty.value.toLocaleString()}</p>
                <p className={`text-sm ${nifty.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {nifty.change >= 0 ? `+${nifty.change.toLocaleString()}` : `${nifty.change.toLocaleString()}`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">SENSEX</p>
                <p className="text-2xl font-bold">{sensex.value.toLocaleString()}</p>
                <p className={`text-sm ${sensex.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {sensex.change >= 0 ? `+${sensex.change.toLocaleString()}` : `${sensex.change.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-900 shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Assets</h2>
            <p>Data will be displayed here...</p>  
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3 p-4 bg-gray-900 shadow-lg rounded-lg ">
            <h2 className="text-xl font-bold mb-4">Investment Chart</h2>
            <div id="tradingview_chart" className="w-full h-64 md:h-80 lg:h-96 rounded-xl"></div>
          </div>
        </div>
      </div>
    </>   
  );
}
