import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Improved directional system logic with better naming and comments
function calculateDMI(data, period = 14) {
  try {
    // Check if data is valid
    if (!data || data.length < period + 1) {
      console.log("Not enough data points for DMI calculation");
      return [];
    }
    
    // Calculate directional movement
    const plusDM   = [0];
    const minusDM  = [0];
    const trueRange = [0];

    for (let i = 1; i < data.length; i++) {
      // diff in closes
      const diff = data[i].close - data[i-1].close;
      // +DM = any positive move, –DM = any negative move
      plusDM.push (Math.max(diff,  0));
      minusDM.push(Math.max(-diff, 0));
      // TR = absolute move
      trueRange.push(Math.abs(diff));
    }
    
    // Calculate smoothed values using Wilder's smoothing
    const smoothedPlusDM = wilderSmooth(plusDM.slice(1), period);
    const smoothedMinusDM = wilderSmooth(minusDM.slice(1), period);
    const smoothedTR = wilderSmooth(trueRange, period);
    
    // Calculate directional indices
    const diPlus = [];
    const diMinus = [];
    const dx = [];
    
    for (let i = 0; i < smoothedTR.length; i++) {
      // DI+/- = (Smoothed +/- DM / Smoothed TR) * 100
      if (smoothedTR[i] > 0) {
        diPlus.push((smoothedPlusDM[i] / smoothedTR[i]) * 100);
        diMinus.push((smoothedMinusDM[i] / smoothedTR[i]) * 100);
      } else {
        diPlus.push(0);
        diMinus.push(0);
      }
      
      // DX = (|DI+ - DI-| / (DI+ + DI-)) * 100
      const sum = diPlus[i] + diMinus[i];
      if (sum > 0) {
        dx.push((Math.abs(diPlus[i] - diMinus[i]) / sum) * 100);
      } else {
        dx.push(0);
      }
    }
    
    // Calculate ADX using Wilder's smoothing of DX
    const adx = calculateADX(dx, period);
    
    // Build the result data structure
    const result = [];

    // diPlus/diMinus/dx all start at data index 1 → diIdx = i-1
    // adx starts at data index = period → adxIdx = i - period
    for (let i = period; i < data.length; i++) {
      const diIdx  = i - 1;
      const adxIdx = i - period;
      result.push({
        time:    data[i].time,
        DIPlus:  diPlus[diIdx],
        DIMinus: diMinus[diIdx],
        DX:      dx[diIdx],
        ADX:     adx[adxIdx]
      });
    }

    return result;
  } catch (err) {
    console.error("Error calculating DMI:", err);
    return [];
  }
}

// Calculate Average Directional Index (ADX)
function calculateADX(dx, period) {
  const adx = [];
  
  // Initial ADX is the simple average of the first period DX values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += dx[i];
  }
  adx.push(sum / period);
  
  // For remaining periods, use Wilder's smoothing
  for (let i = 1; i < dx.length - period + 1; i++) {
    // ADX = ((Prior ADX * (period-1)) + Current DX) / period
    adx.push(((adx[i-1] * (period-1)) + dx[i+period-1]) / period);
  }
  
  return adx;
}

// Wilder's Smoothing Method
function wilderSmooth(data, period) {
  const smoothed = [];
  
  // First value is simple average
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  smoothed.push(sum / period);
  
  // Remaining values use Wilder's formula:
  // Current = ((Previous * (period-1)) + Current Data) / period
  for (let i = period; i < data.length; i++) {
    smoothed.push(((smoothed[smoothed.length-1] * (period-1)) + data[i]) / period);
  }
  
  return smoothed;
}

export default function Stock_Report_Webpage() {
  const {currentUser}  = useAuth();

  useEffect(() => {}, [currentUser]);

  // State for the stock symbol and data
  const [stockSymbol, setStockSymbol] = useState("AAPL"); // Default stock symbol
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // States for chart data
  const [chartData, setChartData] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Directional movement indicator states
  const [indicatorData, setIndicatorData] = useState([]);
  const [indLoading, setIndLoading] = useState(false);

  const periods = ["week", "month", "year", "5 years"];
  const periodTitles = {
    week: "Past Week",
    month: "Past Month",
    year: "Past Year",
    "5 years": "Past 5 Years"
  };

  // Colors for each time period and indicator lines
  const periodColors = [
    "#d12e78", // Week
    "#8884d8", // Month
    "#82ca9d", // Year
    "#ffc658", // Five_Years
  ];
  
  const indicatorColors = {
    DIPlus: "#0088FE",  // Blue for +DI
    DIMinus: "#FF8042", // Orange for -DI
    ADX: "#00C49F",     // Green for ADX
    DX: "#FFBB28"       // Yellow for DX
  };

  // Check if current period is too short for DMI calculations
  const isPeriodTooShort = () => {
    return currentSlide === 0 || currentSlide === 1; // week or month
  };

  // Fetch stock data from API
  async function fetchStockData(symbol, period) {
    setLoading(true);
    setError("");
    setIndicatorData([]);
    setIndLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/stock_report/getStockHistory?symbol=${symbol}&period=${period}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setChartData([]);
        setIndicatorData([]);
      } else {
        setChartData(data.data);

        // Process indicator data only if period is long enough
        if (!isPeriodTooShort() && data.data && data.data.length > 0) {
          // always map just the close-price
          const rawData = data.data.map(d => ({
            time: d.time,
            close: d.price
          }));
          const smoothingPeriod = Math.min(
            14,
            Math.floor((rawData.length + 1) / 2)
          );

          if (rawData.length >= smoothingPeriod + 1) {
            const dmiData = calculateDMI(rawData, smoothingPeriod);
            setIndicatorData(dmiData);
          } else {
            console.log(
              `Need at least ${smoothingPeriod + 1} rows for a ${smoothingPeriod}-period DMI, have ${rawData.length}`
            );
            setIndicatorData([]);
          }
        } else {
          // Clear indicator data for short periods
          setIndicatorData([]);
        }

        // Use real stock info from the API
        if (data.stockInfo) {
          const recommendation = generateRecommendation(data.stockInfo);

          setStockData({
            name: data.stockInfo.name || symbol,
            currentPrice: data.stockInfo.currentPrice,
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
    setIndLoading(false);
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
    fetchStockData(stockSymbol, periods[index]);
  }

  // Handle form submission (fetch stock data when user searches)
  function handleSubmit(e) {
    e.preventDefault();
    if (stockSymbol.trim()) {
      // Reset stockData when searching for a new symbol
      setStockData(null);
      fetchStockData(stockSymbol, periods[currentSlide]);
    }
  }

  // Generate DMI trend signals based on indicator values
  function generateDMISignal(indicatorData) {
    if (!indicatorData || indicatorData.length === 0) return null;
    
    // Get the most recent indicator values
    const latest = indicatorData[indicatorData.length - 1];
    
    if (latest.DIPlus > latest.DIMinus && latest.ADX > 25) {
      return {
        trend: "Strong Uptrend",
        signal: "Bullish",
        description: "The +DI is above -DI and ADX is above 25, indicating a strong uptrend.",
        color: "text-green-600"
      };
    } else if (latest.DIMinus > latest.DIPlus && latest.ADX > 25) {
      return {
        trend: "Strong Downtrend",
        signal: "Bearish",
        description: "The -DI is above +DI and ADX is above 25, indicating a strong downtrend.",
        color: "text-red-600"
      };
    } else if (latest.ADX < 20) {
      return {
        trend: "No Clear Trend",
        signal: "Neutral",
        description: "ADX is below 20, indicating a weak or non-existent trend.",
        color: "text-yellow-600"
      };
    } else {
      return {
        trend: "Moderate Trend",
        signal: latest.DIPlus > latest.DIMinus ? "Mildly Bullish" : "Mildly Bearish",
        description: `ADX is between 20-25, indicating a developing trend. ${latest.DIPlus > latest.DIMinus ? "+DI above -DI suggests bullish momentum." : "-DI above +DI suggests bearish momentum."}`,
        color: latest.DIPlus > latest.DIMinus ? "text-green-500" : "text-red-500"
      };
    }
  }

  // Load initial data when component mounts
  useEffect(() => {
    if (stockSymbol) {
      fetchStockData(stockSymbol, periods[currentSlide]);
    }
  }, []);

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
            <div className="grid grid-cols-3 gap-4">
              <p>
                <strong>Current Price:</strong> $
                {stockData.currentPrice?.toFixed(2) || "N/A"}
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
                  dot={false}
                  activeDot={{ r: 6, fill: periodColors[currentSlide] } }
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

      {/* DMI Indicator Charts */}
      {currentUser &&
      (<div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-center">
            Directional Movement Indicators
          </h2>
        </div>
        
        {/* Display "Range too short" message for week and month periods */}
        {isPeriodTooShort() ? (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-yellow-600 font-medium mb-2">
              Range too short, pick year or 5 year range
            </p>
            <p className="text-center text-gray-500 text-sm">
              DMI calculations require longer time periods for meaningful analysis
            </p>
          </div>
        ) : (
          <>
            {/* DMI Signal Summary */}
            {indicatorData.length > 0 && (
              <div className="mb-6 p-3 border rounded-lg bg-gray-100">
                {(() => {
                  const signal = generateDMISignal(indicatorData);
                  return signal ? (
                    <div className="text-center">
                      <h3 className="font-bold mb-1">DMI Signal</h3>
                      <p className={`text-lg font-semibold ${signal.color}`}>{signal.trend}: {signal.signal}</p>
                      <p className="text-sm mt-1">{signal.description}</p>
                    </div>
                  ) : null;
                })()}
              </div>      
            )}

            {/* Combined ADX & DI Chart */}
            <div className="mb-6">
              <h3 className="text-center font-medium mb-2">ADX & Directional Indicators</h3>
              {indLoading ? (
                <p className="text-center text-gray-500">Loading indicators...</p>
              ) : indicatorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={indicatorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => value?.toFixed(2)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="DIPlus"
                      name="+DI"
                      stroke={indicatorColors.DIPlus}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="DIMinus"
                      name="-DI"
                      stroke={indicatorColors.DIMinus}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="ADX"
                      name="ADX"
                      stroke={indicatorColors.ADX}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">
                  No indicator data available. Try a different time period or stock.
                </p>
              )}
            </div>
            
            {/* DMI Interpretation Guide */}
            <div className="mt-4 p-3 border-t border-gray-200 pt-4">
              <h3 className="font-medium mb-2">How to Interpret DMI</h3>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                <li><span className="font-medium">ADX &gt; 25:</span> Strong trend present (either bullish or bearish)</li>
                <li><span className="font-medium">ADX &lt; 20:</span> Weak or no trend</li>
                <li><span className="font-medium">+DI above -DI:</span> Bullish signal</li>
                <li><span className="font-medium">-DI above +DI:</span> Bearish signal</li>
                <li><span className="font-medium">+DI/-DI crossover:</span> Potential trend reversal</li>
              </ul>
            </div>
          </>
        )}
      </div>)}

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