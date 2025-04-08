import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Stock_Report_Webpage() {
  const currentUser = null;

  // State for the stock symbol and data
  const [stockSymbol, setStockSymbol] = useState("AAPL"); // Default stock symbol
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // States for chart data
  const [chartData, setChartData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const periods = ["day", "week", "month", "year"];
  const periodTitles = {
    day: "Past Day",
    week: "Past Week",
    month: "Past Month",
    year: "Past Year",
  };

  // Colors for each time period
  const periodColors = [
    "#d12e78", // Day
    "#8884d8", // Week
    "#82ca9d", // Month
    "#ffc658", // Year
  ];

  // Auto-change slides every 5 seconds
  // useEffect(() => {
  // if (stockSymbol) {
  //   fetchStockData(stockSymbol, periods[currentSlide]);
  // }

  // // Auto-switch slides every 5 seconds
  // const timer = setInterval(() => {
  //   setCurrentSlide((prevSlide) => {
  //     const nextSlide = (prevSlide + 1) % periods.length;
  //     fetchStockData(stockSymbol, periods[nextSlide]); // Fetch data based on the next period
  //     return nextSlide;
  //   });
  // }, 5000);

  // return () => clearInterval(timer); // Cleanup timer when component unmounts
  // }, [stockSymbol, currentSlide]);

  // Fetch stock data from API
  async function fetchStockData(symbol, period) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/stock_report/getStockHistory?symbol=${symbol}&period=${period}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setChartData([]);
      } else {
        setChartData(data.data);

        // Use real stock info from the API
        if (data.stockInfo) {
          const recommendation = generateRecommendation(data.stockInfo);

          setStockData({
            name: data.stockInfo.name || symbol,
            currentPrice: data.stockInfo.currentPrice,
            marketCap: data.stockInfo.marketCap,
            peRatio: data.stockInfo.peRatio,
            week52High: data.stockInfo.week52High,
            week52Low: data.stockInfo.week52Low,
            message: recommendation,
          });
        }
      }
    } catch (err) {
      setError("Failed to fetch stock data.");
    }

    setLoading(false);
  }

  // Generate a recommendation based on price position between 52-week high and low
  function generateRecommendation(stockInfo) {
    if (
      !stockInfo ||
      !stockInfo.currentPrice ||
      !stockInfo.week52High ||
      !stockInfo.week52Low
    ) {
      return "Recommendation: Insufficient data";
    }

    const range = stockInfo.week52High - stockInfo.week52Low;
    if (range === 0) return "Recommendation: Hold";

    const position = (stockInfo.currentPrice - stockInfo.week52Low) / range;

    if (position < 0.3) return "Recommendation: Buy - Near 52-week low";
    if (position > 0.7) return "Recommendation: Sell - Near 52-week high";
    return "Recommendation: Hold - Mid range";
  }

  function handleSlideChange(index) {
    setCurrentSlide(index);
    fetchStockData(stockSymbol, periods[index]); // Fetch data based on the selected period
  }

  // Handle form submission (fetch stock data when user searches)
  function handleSubmit(e) {
    e.preventDefault();
    if (stockSymbol.trim()) {
      // Reset stockData when searching for a new symbol
      setStockData(null);
      fetchStockData(stockSymbol, periods[currentSlide]); // Fetch new data for the selected period
    }
  }

  // Format market cap for display
  function formatMarketCap(marketCap) {
    if (!marketCap) return "N/A";

    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Report</h1>

        <form className="rounded-lg bg-gray-50 w-1/2" onSubmit={handleSubmit}>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter Stock Symbol (e.g., AAPL)"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={stockSymbol}
              onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {stockData ? (
        <>
          <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text">
            {stockData.name || stockSymbol}
          </h1>

          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Stock Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Current Price:</strong> $
                {stockData.currentPrice?.toFixed(2) || "N/A"}
              </p>
              <p>
                <strong>Market Cap:</strong>{" "}
                {formatMarketCap(stockData.marketCap)}
              </p>
              <p>
                <strong>P/E Ratio:</strong>{" "}
                {stockData.peRatio?.toFixed(2) || "N/A"}
              </p>
              <p>
                <strong>52-Week High:</strong> $
                {stockData.week52High?.toFixed(2) || "N/A"}
              </p>
              <p>
                <strong>52-Week Low:</strong> $
                {stockData.week52Low?.toFixed(2) || "N/A"}
              </p>
            </div>

            {currentUser && stockData.message && (
              <div className="mt-4 p-2 bg-green-50 text-green-700 rounded">
                {stockData.message}
              </div>
            )}
          </div>
        </>
      ) : (
        <h1 className="text-3xl font-semibold text-center mb-8 text-gray-500">
          {loading ? "Loading..." : "Enter a stock symbol to get started"}
        </h1>
      )}

      {/* Stock Price Chart */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-center">
          {periodTitles[periods[currentSlide]]}
        </h2>
        <h3 className="text-center mb-4 text-gray-600">
          {stockData?.name || stockSymbol} Stock
        </h3>
        <div className="w-full h-56">
          {loading ? (
            <p className="text-center text-lg text-gray-600">
              Loading stock data...
            </p>
          ) : error ? (
            <p className="text-center text-lg text-red-600">{error}</p>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis
                  dataKey="time"
                  stroke="#666"
                  tickMargin={5}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#666"
                  domain={["auto", "auto"]}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f9f9f9",
                    borderColor: "#ddd",
                    color: "#333",
                  }}
                  labelStyle={{ color: "#333" }}
                  formatter={(value) => [`$${value}`, "Price"]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={periodColors[currentSlide]} // Use the color based on the slide
                  strokeWidth={3}
                  dot={{ fill: periodColors[currentSlide], r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-lg text-gray-600">
              No chart data available.
            </p>
          )}
        </div>
        <div className="flex justify-center mt-4">
          {periods.map((period, index) => (
            <div key={index} className="flex flex-col items-center mx-2">
              <button
                className={`h-3 w-3 rounded-full transition ${
                  currentSlide === index
                    ? "bg-blue-600"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
                onClick={() => handleSlideChange(index)}
              />
              <span className="text-xs mt-1 text-gray-600 capitalize">
                {period}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Score Section (for logged in users only) */}
      {currentUser && (
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Risk Score</h2>
          <p className="text-lg">
            {stockData ? "7.5/10 (Moderate Risk)" : "--"}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Premium feature available to logged-in users only.
          </p>
        </div>
      )}

      {/* Prompt to Log In/Sign Up */}
      {!currentUser && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Access More Features</h2>
          <p className="mb-4">
            Log in or sign up to access premium features like risk assessment,
            portfolio tracking, and more.
          </p>
          <div className="flex gap-4">
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login
            </a>
            <a
              href="/signup"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Sign Up
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
