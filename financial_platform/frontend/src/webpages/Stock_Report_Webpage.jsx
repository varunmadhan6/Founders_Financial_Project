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
import { useAuth } from "../contexts/AuthContext";

export default function Stock_Report_Webpage() {
  const { currentUser } = useAuth();
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample data for chart displays
  const dayData = [
    { time: "09:30 AM", price: 241.67 },
    { time: "10:30 AM", price: 242.1 },
    { time: "11:30 AM", price: 241.5 },
    { time: "12:30 PM", price: 240.8 },
    { time: "01:30 PM", price: 239.9 },
    { time: "02:30 PM", price: 239.2 },
    { time: "03:30 PM", price: 238.5 },
    { time: "04:00 PM", price: 238.16 },
  ];

  const weekData = [
    { time: "Feb 24, 2025", price: 247.17 },
    { time: "Feb 25, 2025", price: 247.04 },
    { time: "Feb 26, 2025", price: 240.36 },
    { time: "Feb 27, 2025", price: 237.3 },
    { time: "Feb 28, 2025", price: 241.84 },
    { time: "Mar 3, 2025", price: 238.03 },
  ];

  const monthData = [
    { time: "Week 1", price: 227.56 },
    { time: "Week 2", price: 231.78 },
    { time: "Week 3", price: 235.9 },
    { time: "Week 4", price: 247.04 },
    { time: "Current", price: 238.03 },
  ];

  const yearData = [
    { time: "Mar 2024", price: 192.0 },
    { time: "Apr 2024", price: 195.2 },
    { time: "May 2024", price: 198.1 },
    { time: "Jun 2024", price: 202.5 },
    { time: "Jul 2024", price: 207.8 },
    { time: "Aug 2024", price: 212.3 },
    { time: "Sep 2024", price: 218.9 },
    { time: "Oct 2024", price: 225.4 },
    { time: "Nov 2024", price: 230.6 },
    { time: "Dec 2024", price: 250.15 },
    { time: "Jan 2025", price: 243.85 },
    { time: "Feb 2025", price: 241.84 },
    { time: "Mar 2025", price: 238.03 },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { data: dayData, title: "Past Day", color: "#d12e78" },
    { data: weekData, title: "Past Week", color: "#8884d8" },
    { data: monthData, title: "Past Month", color: "#82ca9d" },
    { data: yearData, title: "Past Year", color: "#ffc658" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const fetchStockData = async (e) => {
    e.preventDefault();

    if (!stockSymbol) {
      setError("Please enter a stock symbol");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("token");

      // Create headers with Authorization if token exists
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        `http://localhost:5000/api/getStockInfo?symbol=${stockSymbol}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch stock data");
      }

      const data = await response.json();
      setStockData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Report</h1>

        <form className="rounded-lg bg-gray-50 w-1/2" onSubmit={fetchStockData}>
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
            {stockData.name} ({stockSymbol})
          </h1>

          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Stock Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Current Price:</strong> $
                {stockData.currentPrice?.toFixed(2) || "N/A"}
              </p>
              <p>
                <strong>Market Cap:</strong> $
                {stockData.marketCap?.toLocaleString() || "N/A"}
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
          Enter a stock symbol to get started
        </h1>
      )}

      {/* Chart section - always visible for demonstration */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-center">
          {slides[currentSlide].title}
        </h2>
        <h3 className="text-center mb-4 text-gray-600">
          {stockData ? `${stockData.name} Stock` : "Sample Stock Data"}
        </h3>
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={slides[currentSlide].data}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis
                dataKey="time"
                stroke="#666"
                tickMargin={5}
                interval="preserveStartEnd"
              />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9f9f9",
                  borderColor: "#ddd",
                  color: "#333",
                }}
                labelStyle={{ color: "#333" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={slides[currentSlide].color}
                strokeWidth={3}
                dot={{ fill: slides[currentSlide].color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-3 rounded-full transition ${
                currentSlide === index
                  ? "bg-blue-600"
                  : "bg-gray-400 hover:bg-gray-500"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Note: Only show risk score for logged in users */}
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

      {!currentUser && (
        <div className="p-4 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-2">Access More Features</h2>
          <p className="mb-4">
            Log in or sign up to access premium features like risk assessment,
            portfolio tracking, and more.
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
