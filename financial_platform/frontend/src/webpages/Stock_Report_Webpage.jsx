import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
 
// export default function Stock_Report_Webpage() {
//   // For demonstration, currentUser is null (or an object if logged in)
//   const currentUser = null;

//   const [symbol, setSymbol] = useState("AAPL"); // Default stock symbol
//   const [stockData, setStockData] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
 
//   const periods = ["day", "week", "month", "year"];
 
//    // Colors for each time period
//   const periodColors = [
//     "#d12e78", // Day
//     "#8884d8", // Week
//     "#82ca9d", // Month
//     "#ffc658"  // Year
//   ];


//    // Auto-change slides every 5 seconds
//    useEffect(() => {
//     fetchStockData(symbol, periods[currentSlide]);

//     // Auto-switch slides every 5 seconds
//     const timer = setInterval(() => {
//       setCurrentSlide((prevSlide) => {
//         const nextSlide = (prevSlide + 1) % periods.length;
//         fetchStockData(symbol, periods[nextSlide]); // Fetch data based on the next period
//         return nextSlide;
//       });
//     }, 5000);

//     return () => clearInterval(timer); // Cleanup timer when component unmounts
//   }, [symbol, currentSlide]);

//   // Fetch stock data
//   async function fetchStockData(stockSymbol, period) {
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch(`http://127.0.0.1:5000/api/stock_report/getStockHistory?symbol=${stockSymbol}&period=${period}`);
//       const data = await response.json();

//       if (data.error) {
//         setError(data.error);
//         setStockData([]);
//       } else {
//         setStockData(data.data);
//       }
//     } catch (err) {
//       setError("Failed to fetch stock data.");
//     }

//     setLoading(false);
//   }

//   function handleSlideChange(index) {
//     setCurrentSlide(index);
//     fetchStockData(symbol, periods[index]); // Fetch data based on the selected period
//   }

//   // Handle form submission (fetch stock data when user searches)
//   function handleSubmit(e) {
//     e.preventDefault();
//     if (symbol.trim()) {
//       fetchStockData(symbol, periods[currentSlide]); // Fetch new data for the selected period
//     }
//   }

//   return (
     
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">

//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Stock Report</h1>
//         <form className="rounded-lg bg-gray-50 w-1/2" onSubmit={handleSubmit}>
//            <div className="flex space-x-2">
//              <input
//                type="text"
//                placeholder="Enter Stock Symbol (e.g., AAPL)"
//                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                value={symbol}
//                onChange={(e) => setSymbol(e.target.value)}
//              />
//              <button 
//                type="submit" 
//                className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//              >
//                Search
//              </button>
//            </div>
//          </form>
//        </div>

//        <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text">{symbol}</h1>

//        {loading ? (
//          <p className="text-center text-lg text-gray-600">Loading stock data...</p>
//        ) : error ? (
//          <p className="text-center text-lg text-red-600">{error}</p>
//        ) : (
//          <>
//            {/* Stock Price Chart */}
//            <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
//              <h2 className="text-xl font-semibold mb-2 text-center">Past {periods[currentSlide]}</h2>
//              <h3 className="text-center mb-4 text-gray-600">{symbol} Stock</h3>
//              <div className="w-full h-56">
//                <ResponsiveContainer width="100%" height="100%">
//                  <LineChart data={stockData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
//                    <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
//                    <XAxis dataKey="time" stroke="#666" tickMargin={5} interval="preserveStartEnd" />
//                    <YAxis stroke="#666" />
//                    <Tooltip 
//                      contentStyle={{ backgroundColor: "#f9f9f9", borderColor: "#ddd", color: "#333" }} 
//                      labelStyle={{ color: "#333" }}
//                    />
//                    <Line 
//                      type="monotone" 
//                      dataKey="price" 
//                      stroke={periodColors[currentSlide]} // Use the color based on the slide
//                      strokeWidth={3} 
//                      dot={{ fill: periodColors[currentSlide], r: 4 }}
//                      activeDot={{ r: 6 }}
//                    />
//                  </LineChart>
//                </ResponsiveContainer>
//              </div>
//              <div className="flex justify-center mt-4 space-x-2">
//                {periods.map((_, index) => (
//                  <button 
//                    key={index}
//                    className={`h-3 w-3 rounded-full transition ${currentSlide === index ? "bg-blue-600" : "bg-gray-400 hover:bg-gray-500"}`}
//                    onClick={() => handleSlideChange(index)}
//                  />
//                ))}
//              </div>
//            </div>
//          </>
//        )}
//      </div>

//     );
//   }

export default function Stock_Report_Webpage() {

  const currentUser = null;

  // State for the stock symbol input and fetched stock info
  const [stockSymbol, setStockSymbol] = useState("");
  const [selectedStock, setSelectedStock] = useState(""); // Symbol used for fetching live data
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for live chart data
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  // Define available periods and corresponding titles/colors for the chart
  const periods = ["day", "week", "month", "year"];
  const periodTitles = {
    day: "Past Day",
    week: "Past Week",
    month: "Past Month",
    year: "Past Year",
  };
  const periodColors = {
    day: "#d12e78",
    week: "#8884d8",
    month: "#82ca9d",
    year: "#ffc658",
  };

  // State for the currently selected period (slide)
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-change slides (periods) every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % periods.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Whenever the selected stock or the period changes, fetch live chart data
  useEffect(() => {
    if (selectedStock) {
      fetchChartData(selectedStock, periods[currentSlide]);
    }
  }, [selectedStock, currentSlide]);

  // Function to fetch live chart data based on the stock symbol and period
  async function fetchChartData(symbol, period) {
    setChartLoading(true);
    setChartError(null);
    try {
      const response = await fetch(
        await fetch(`http://127.0.0.1:5000/api/stock_report/getStockHistory?symbol=${stockSymbol}&period=${period}`)
      );
      const data = await response.json();
      if (data.error) {
        setChartError(data.error);
        setChartData([]);
      } else {
        setChartData(data.data);
      }
    } catch (err) {
      setChartError("Failed to fetch chart data.");
      setChartData([]);
    }
    setChartLoading(false);
  }

  // Function to fetch stock info when the user submits the search form
  const fetchStockInfo = async (e) => {
    e.preventDefault();

    if (!stockSymbol) {
      setError("Please enter a stock symbol");
      return;
    }

    setLoading(true);
    setError(null);
    // Set the symbol to fetch live data for the chart
    setSelectedStock(stockSymbol);

    try {
      // Simulated API call for stock information.
      // Replace this simulated call with your actual API call when ready.
      setTimeout(() => {
        setStockData({
          name: stockSymbol,
          currentPrice: 238.03,
          marketCap: 3850000000,
          peRatio: 28.42,
          week52High: 250.15,
          week52Low: 192.0,
          message: "Recommendation: Hold",
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Stock Report</h1>

        <form className="rounded-lg bg-gray-50 w-1/2" onSubmit={fetchStockInfo}>
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

      {/* Live Chart Section */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-center">
          {periodTitles[periods[currentSlide]]}
        </h2>
        <h3 className="text-center mb-4 text-gray-600">
          {stockData ? `${stockData.name} Stock` : "Live Stock Data"}
        </h3>
        <div className="w-full h-56">
          {chartLoading ? (
            <p className="text-center text-lg text-gray-600">
              Loading chart data...
            </p>
          ) : chartError ? (
            <p className="text-center text-lg text-red-600">{chartError}</p>
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
                  stroke={periodColors[periods[currentSlide]]}
                  strokeWidth={3}
                  dot={{
                    fill: periodColors[periods[currentSlide]],
                    r: 4,
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-lg text-gray-600">
              No chart data available.
            </p>
          )}
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          {periods.map((period, index) => (
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
