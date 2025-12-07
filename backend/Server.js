const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

app.get("/api/coins", async (req, res) => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: { vs_currency: "INR" }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

// Market Indices API
app.get("/api/indices", async (req, res) => {
  try {
    // Use 5d range to get more data points for better change calculation
    const [niftyRes, sensexRes] = await Promise.all([
      axios.get("https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=5d"),
      axios.get("https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN?interval=1d&range=5d")
    ]);

    const niftyData = niftyRes.data.chart.result[0];
    const sensexData = sensexRes.data.chart.result[0];

    // Parse NIFTY values - use direct change fields from API if available
    const niftyPrice = parseFloat(niftyData.meta.regularMarketPrice) || parseFloat(niftyData.meta.previousClose) || 0;
    const niftyPrevClose = parseFloat(niftyData.meta.previousClose) || 0;
    
    // Try multiple methods to get change
    let niftyChange = parseFloat(niftyData.meta.regularMarketChange);
    let niftyChangePercent = parseFloat(niftyData.meta.regularMarketChangePercent);
    
    // If API doesn't provide change, calculate from price difference
    if (isNaN(niftyChange) || niftyChange === 0) {
      niftyChange = niftyPrice - niftyPrevClose;
    }
    if (isNaN(niftyChangePercent) || niftyChangePercent === 0) {
      niftyChangePercent = niftyPrevClose > 0 ? ((niftyChange / niftyPrevClose) * 100) : 0;
    }
    
    // If still 0, try using chart data (last close vs previous close)
    if (niftyChange === 0 && niftyData.indicators && niftyData.indicators.quote && niftyData.indicators.quote[0]) {
      const closes = niftyData.indicators.quote[0].close;
      if (closes && closes.length >= 2) {
        const lastClose = closes[closes.length - 1];
        const prevClose = closes[closes.length - 2];
        if (lastClose && prevClose) {
          niftyChange = lastClose - prevClose;
          niftyChangePercent = prevClose > 0 ? ((niftyChange / prevClose) * 100) : 0;
        }
      }
    }

    // Parse SENSEX values - use direct change fields from API if available
    const sensexPrice = parseFloat(sensexData.meta.regularMarketPrice) || parseFloat(sensexData.meta.previousClose) || 0;
    const sensexPrevClose = parseFloat(sensexData.meta.previousClose) || 0;
    
    // Try multiple methods to get change
    let sensexChange = parseFloat(sensexData.meta.regularMarketChange);
    let sensexChangePercent = parseFloat(sensexData.meta.regularMarketChangePercent);
    
    // If API doesn't provide change, calculate from price difference
    if (isNaN(sensexChange) || sensexChange === 0) {
      sensexChange = sensexPrice - sensexPrevClose;
    }
    if (isNaN(sensexChangePercent) || sensexChangePercent === 0) {
      sensexChangePercent = sensexPrevClose > 0 ? ((sensexChange / sensexPrevClose) * 100) : 0;
    }
    
    // If still 0, try using chart data (last close vs previous close)
    if (sensexChange === 0 && sensexData.indicators && sensexData.indicators.quote && sensexData.indicators.quote[0]) {
      const closes = sensexData.indicators.quote[0].close;
      if (closes && closes.length >= 2) {
        const lastClose = closes[closes.length - 1];
        const prevClose = closes[closes.length - 2];
        if (lastClose && prevClose) {
          sensexChange = lastClose - prevClose;
          sensexChangePercent = prevClose > 0 ? ((sensexChange / prevClose) * 100) : 0;
        }
      }
    }

    const nifty = {
      value: niftyPrice,
      change: niftyChange,
      changePercent: isNaN(niftyChangePercent) ? 0 : parseFloat(niftyChangePercent.toFixed(2)),
      previousClose: niftyPrevClose
    };

    const sensex = {
      value: sensexPrice,
      change: sensexChange,
      changePercent: isNaN(sensexChangePercent) ? 0 : parseFloat(sensexChangePercent.toFixed(2)),
      previousClose: sensexPrevClose
    };

    res.json({ nifty, sensex });
  } catch (error) {
    console.error("Error fetching indices:", error);
    res.status(500).json({ error: "Error fetching market indices" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
