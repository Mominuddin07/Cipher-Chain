import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCryptoState } from "../../cryptocontext";
import { TrendingCoins } from "../../config/api";
import AliceCarousel from "react-alice-carousel";

const Carousel = () => {
  const [trending, setTrending] = useState([]);
  const { currency, symbol } = useCryptoState();

  // Fetch trending coins
  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        const { data } = await axios.get(TrendingCoins(currency));
        setTrending(data);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      }
    };

    fetchTrendingCoins();
  }, [currency]);

  // Helper function to format numbers with commas
  const numberWithCommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const items = trending.map((coin) => {
    const profit = coin?.price_change_percentage_24h >= 0;

    return (
      <div key={coin.id} className="flex flex-col items-center text-center cursor-pointer text-white">
        <img
          src={coin?.image || "fallback-image-url.jpg"}
          alt={coin.name}
          className="h-20 mb-4"
        />
        <span className="text-lg font-semibold uppercase">
          {coin?.symbol}
          <span className={`ml-2 ${profit ? "text-green-500" : "text-red-500"} font-bold`}>
            {profit && "+"}
            {coin?.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </span>
        <span className="text-xl font-bold">
          {symbol} {numberWithCommas(coin?.current_price.toFixed(2))}
        </span>
      </div>
    );
  });

  const responsive = {
    0: {
      items: 2,
    },
    512: {
      items: 4,
    },
  };

  return (
    <div className="flex items-center h-[50%]">
      <AliceCarousel
        mouseTracking
        infinite
        autoPlayInterval={1000}
        animationDuration={1500}
        disableDotsControls
        disableButtonsControls
        responsive={responsive}
        autoPlay
        items={items}
      />
    </div>
  );
};

export default Carousel;
