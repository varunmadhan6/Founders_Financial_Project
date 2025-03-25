import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Stock_Report_Webpage() {
  const [symbol, setSymbol] = useState("AAPL"); // Default stock symbol
  const [stockData, setStockData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const periods = ["day", "week", "month", "year"];

  // Colors for each time period
  const periodColors = [
    "#d12e78", // Day
    "#8884d8", // Week
    "#82ca9d", // Month
    "#ffc658"  // Year
  ];

  // Auto-change slides every 5 seconds
  useEffect(() => {
    fetchStockData(symbol, periods[currentSlide]);

    // Auto-switch slides every 5 seconds
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        const nextSlide = (prevSlide + 1) % periods.length;
        fetchStockData(symbol, periods[nextSlide]); // Fetch data based on the next period
        return nextSlide;
      });
    }, 5000);

    return () => clearInterval(timer); // Cleanup timer when component unmounts
  }, [symbol, currentSlide]);

  // Fetch stock data
  async function fetchStockData(stockSymbol, period) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/stock_report/getStockHistory?symbol=${stockSymbol}&period=${period}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setStockData([]);
      } else {
        setStockData(data.data);
      }
    } catch (err) {
      setError("Failed to fetch stock data.");
    }

    setLoading(false);
  }

  function handleSlideChange(index) {
    setCurrentSlide(index);
    fetchStockData(symbol, periods[index]); // Fetch data based on the selected period
  }
  
  // Handle form submission (fetch stock data when user searches)
  function handleSubmit(e) {
    e.preventDefault();
    if (symbol.trim()) {
      fetchStockData(symbol, periods[currentSlide]); // Fetch new data for the selected period
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
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <button 
              type="submit" 
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text">{symbol}</h1>

      {loading ? (
        <p className="text-center text-lg text-gray-600">Loading stock data...</p>
      ) : error ? (
        <p className="text-center text-lg text-red-600">{error}</p>
      ) : (
        <>
          {/* Stock Price Chart */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-center">Past {periods[currentSlide]}</h2>
            <h3 className="text-center mb-4 text-gray-600">{symbol} Stock</h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stockData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="time" stroke="#666" tickMargin={5} interval="preserveStartEnd" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#f9f9f9", borderColor: "#ddd", color: "#333" }} 
                    labelStyle={{ color: "#333" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={periodColors[currentSlide]} // Use the color based on the slide
                    strokeWidth={3} 
                    dot={{ fill: periodColors[currentSlide], r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              {periods.map((_, index) => (
                <button 
                  key={index}
                  className={`h-3 w-3 rounded-full transition ${currentSlide === index ? "bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
                  onClick={() => handleSlideChange(index)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
