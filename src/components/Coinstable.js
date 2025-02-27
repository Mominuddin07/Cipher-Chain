import React, { useEffect, useState } from "react";
import axios from "axios";
import { CoinList } from "../config/api";
import { useCryptoState } from "../cryptocontext";

const Coinstable = () => {
  const { currency, symbol } = useCryptoState();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Fetch Coins Data
  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true);
      const { data } = await axios.get(CoinList(currency));
      setCoins(data);
      setLoading(false);
    };
    fetchCoins();
  }, [currency]);

  // Number formatting with commas
  const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Filter coins based on search input
  const handleSearch = () => {
    return coins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="text-center p-6 bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-white">Cryptocurrency Prices by Market Cap</h2>
      <input
        type="text"
        placeholder="Search for a Cryptocurrency..."
        className="w-full p-3 mb-6 rounded-lg bg-gray-800 text-white placeholder-gray-400"
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <div className="overflow-x-auto ">
        {loading ? (
          <div className="w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse"></div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-yellow-500 text-black">
              <tr>
                {["Coin", "Price", "24h Change", "Market Cap"].map((head) => (
                  <th key={head} className="p-3 text-left">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {handleSearch()
                .slice((page - 1) * 10, (page - 1) * 10 + 10)
                .map((row) => {
                  const profit = row.price_change_percentage_24h > 0;
                  return (
                    <tr key={row.name} className="bg-gray-900 hover:bg-gray-800 cursor-pointer">
                      <td className="flex items-center gap-4 p-3">
                        <img src={row.image} alt={row.name} className="h-12 w-12" />
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold uppercase text-gray-100">{row.symbol}</span>
                          <span className="text-gray-400">{row.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-left text-white ">{symbol} {numberWithCommas(row.current_price.toFixed(2))}</td>
                      <td className={`p-3 text-left font-medium ${profit ? "text-green-400" : "text-red-500"}`}>
                        {profit && "+"}{row.price_change_percentage_24h.toFixed(2)}%
                      </td>
                      <td className="p-3 text-left text-white">{symbol} {numberWithCommas(row.market_cap.toString().slice(0, -6))}M</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: Math.ceil(handleSearch()?.length / 10) }, (_, i) => (
          <button
            key={i}
            className={`px-4 py-2 mx-1 rounded-full ${page === i + 1 ? "bg-yellow-500 text-black" : "bg-gray-700 text-white"}`}
            onClick={() => {
              setPage(i + 1);
              window.scrollTo({ top: 450, behavior: "smooth" });
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Coinstable;
