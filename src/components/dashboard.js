import React, { useEffect, useRef, useState } from "react";
import { FaChartLine, FaCoins, FaSignOutAlt, FaHome, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CoinList } from "../config/api";
import { useCryptoState } from "../cryptocontext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

let tvScriptLoadingPromise;

export default function Dashboard() {
  const onLoadScriptRef = useRef();
  const { currency, symbol } = useCryptoState();
  const navigate = useNavigate();
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indicesLoading, setIndicesLoading] = useState(true);
  const [nifty, setNifty] = useState({ value: 0, change: 0, changePercent: 0, previousClose: 0 });
  const [sensex, setSensex] = useState({ value: 0, change: 0, changePercent: 0, previousClose: 0 });

  // Fetch real-time crypto data
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const { data } = await axios.get(CoinList(currency));
        setCryptoData(data.slice(0, 3)); // Get top 3 cryptocurrencies
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setLoading(false);
      }
    };
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [currency]);

  // TradingView Chart
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
          symbol: "BINANCE:BTCUSDT",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#1a1a1a",
          enable_publishing: false,
          allow_symbol_change: true,
          studies: ["STD;SMA", "STD;MACD", "STD;RSI"],
          container_id: "tradingview_chart",
        });
      }
    }
  }, []);

  // Fetch real-time market indices from backend
  useEffect(() => {
    const fetchMarketIndices = async () => {
      setIndicesLoading(true);
      try {
        // Try backend API first
        try {
          const response = await axios.get("http://localhost:5000/api/indices");
          if (response.data && response.data.nifty && response.data.sensex) {
            const niftyValue = parseFloat(response.data.nifty.value) || 0;
            const niftyChange = parseFloat(response.data.nifty.change) || 0;
            const niftyChangePercent = parseFloat(response.data.nifty.changePercent) || 0;
            const niftyPrevClose = parseFloat(response.data.nifty.previousClose) || (niftyValue - niftyChange);
            
            const sensexValue = parseFloat(response.data.sensex.value) || 0;
            const sensexChange = parseFloat(response.data.sensex.change) || 0;
            const sensexChangePercent = parseFloat(response.data.sensex.changePercent) || 0;
            const sensexPrevClose = parseFloat(response.data.sensex.previousClose) || (sensexValue - sensexChange);
            
            setNifty({
              value: niftyValue,
              change: niftyChange,
              changePercent: isNaN(niftyChangePercent) ? 0 : niftyChangePercent,
              previousClose: niftyPrevClose
            });
            setSensex({
              value: sensexValue,
              change: sensexChange,
              changePercent: isNaN(sensexChangePercent) ? 0 : sensexChangePercent,
              previousClose: sensexPrevClose
            });
            setIndicesLoading(false);
            return;
          }
        } catch (backendError) {
          console.log("Backend API not available, trying direct API...");
        }

         // Fallback: Try direct API with CORS proxy
         try {
           // Fetch NIFTY 50
           const niftyProxyRes = await axios.get(
             `https://api.allorigins.win/get?url=${encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=1d')}`,
             { timeout: 10000 }
           );
           const niftyData = JSON.parse(niftyProxyRes.data.contents);
           if (niftyData.chart && niftyData.chart.result && niftyData.chart.result[0]) {
             const meta = niftyData.chart.result[0].meta;
             const niftyPrice = parseFloat(meta.regularMarketPrice) || parseFloat(meta.previousClose) || parseFloat(meta.chartPreviousClose) || 0;
             const niftyPrevClose = parseFloat(meta.previousClose) || parseFloat(meta.chartPreviousClose) || niftyPrice;
             
             if (niftyPrice > 0) {
               const niftyChange = niftyPrice - niftyPrevClose;
               const niftyChangePercent = niftyPrevClose > 0 ? ((niftyChange / niftyPrevClose) * 100) : 0;
               
               setNifty({
                 value: niftyPrice,
                 change: niftyChange,
                 changePercent: isNaN(niftyChangePercent) ? 0 : niftyChangePercent,
                 previousClose: niftyPrevClose
               });
             }
           }

           // Fetch SENSEX
           const sensexProxyRes = await axios.get(
             `https://api.allorigins.win/get?url=${encodeURIComponent('https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN?interval=1d&range=1d')}`,
             { timeout: 10000 }
           );
           const sensexData = JSON.parse(sensexProxyRes.data.contents);
           if (sensexData.chart && sensexData.chart.result && sensexData.chart.result[0]) {
             const meta = sensexData.chart.result[0].meta;
             const sensexPrice = parseFloat(meta.regularMarketPrice) || parseFloat(meta.previousClose) || parseFloat(meta.chartPreviousClose) || 0;
             const sensexPrevClose = parseFloat(meta.previousClose) || parseFloat(meta.chartPreviousClose) || sensexPrice;
             
             if (sensexPrice > 0) {
               const sensexChange = sensexPrice - sensexPrevClose;
               const sensexChangePercent = sensexPrevClose > 0 ? ((sensexChange / sensexPrevClose) * 100) : 0;
               
               setSensex({
                 value: sensexPrice,
                 change: sensexChange,
                 changePercent: isNaN(sensexChangePercent) ? 0 : sensexChangePercent,
                 previousClose: sensexPrevClose
               });
             }
           }
         } catch (error) {
           console.error("Error fetching market indices:", error);
           // Set default values if all methods fail
           if (nifty.value === 0) {
             setNifty({ value: 0, change: 0, changePercent: 0, previousClose: 0 });
           }
           if (sensex.value === 0) {
             setSensex({ value: 0, change: 0, changePercent: 0, previousClose: 0 });
           }
         }

        setIndicesLoading(false);
      } catch (error) {
        console.error("Error fetching market indices:", error);
        setIndicesLoading(false);
      }
    };

    fetchMarketIndices();
    const interval = setInterval(fetchMarketIndices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = () => {
    navigate("/homepage");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Cipher Chain
        </h1>
        <nav className="flex flex-col gap-3">
          <button className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-white hover:from-cyan-500/30 hover:to-blue-500/30 transition">
            <FaHome /> Dashboard
          </button>
          <button
            onClick={handleNavigate}
            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition"
          >
            <FaCoins /> Cipher Chain
          </button>
          <button
            onClick={() => window.open("https://thenewscrypto.com", "_blank")}
            className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition"
          >
            <FaChartLine /> News
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 hover:bg-red-500/20 rounded-xl transition mt-auto"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Cipher Chain Card */}
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl hover:bg-white/10 transition">
            <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Cipher Chain
            </h2>
            <p className="text-gray-400 mb-4">
              Crypto coin insights provide real-time data on price movements, market trends
            </p>
            <button
              onClick={handleNavigate}
              className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition font-semibold"
            >
              View Insights
            </button>
          </div>

          {/* Market Indices Card */}
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Market Indices</h2>
            {indicesLoading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">NIFTY 50</p>
                    {nifty.value > 0 ? (
                      <>
                        <p className="text-2xl font-bold">{nifty.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        {nifty.previousClose > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Prev: {nifty.previousClose.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg text-gray-500">Loading...</p>
                    )}
                  </div>
                   {nifty.value > 0 && !isNaN(nifty.change) && !isNaN(nifty.changePercent) && (
                     <div className="text-right">
                       <p className={`text-xs font-medium mb-1 ${nifty.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                         {nifty.change >= 0 ? "Profit" : "Loss"}
                       </p>
                       <p className={`text-sm font-semibold flex items-center justify-end gap-1 ${nifty.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                         {nifty.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                         {nifty.change >= 0 ? "+" : ""}{nifty.change.toFixed(2)}
                       </p>
                       <p className={`text-xs ${nifty.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                         {nifty.change >= 0 ? "+" : ""}{nifty.changePercent.toFixed(2)}%
                       </p>
                     </div>
                   )}
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">SENSEX</p>
                    {sensex.value > 0 ? (
                      <>
                        <p className="text-2xl font-bold">{sensex.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        {sensex.previousClose > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Prev: {sensex.previousClose.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg text-gray-500">Loading...</p>
                    )}
                  </div>
                   {sensex.value > 0 && !isNaN(sensex.change) && !isNaN(sensex.changePercent) && (
                     <div className="text-right">
                       <p className={`text-xs font-medium mb-1 ${sensex.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                         {sensex.change >= 0 ? "Profit" : "Loss"}
                       </p>
                       <p className={`text-sm font-semibold flex items-center justify-end gap-1 ${sensex.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                         {sensex.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                         {sensex.change >= 0 ? "+" : ""}{sensex.change.toFixed(2)}
                       </p>
                       <p className={`text-xs ${sensex.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                         {sensex.change >= 0 ? "+" : ""}{sensex.changePercent.toFixed(2)}%
                       </p>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* Top Crypto Assets Card */}
          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Top Assets</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {cryptoData.map((coin) => (
                  <div key={coin.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                      <div>
                        <p className="font-semibold">{coin.symbol.toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{coin.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{symbol}{coin.current_price.toLocaleString()}</p>
                      <p className={`text-xs ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chart Card */}
        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4">Investment Chart</h2>
          <div id="tradingview_chart" className="w-full h-96 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
