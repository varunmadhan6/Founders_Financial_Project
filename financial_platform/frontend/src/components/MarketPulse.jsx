import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";

const MarketPulseDashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("1M");
  const [displayData, setDisplayData] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {}, [currentUser]);

  // Fetch fresh data whenever the timeRange changes
  useEffect(() => {
    fetchMarketData();
  }, [timeRange]);

  /**
   * Hit your real Flask (or other) backend to get market pulse data.
   */
  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      // Add the timeRange as a query parameter
      const response = await fetch(
        `http://127.0.0.1:5000/api/stock/api/market-pulse?range=${timeRange}`
      );
      console.log("Response:", response);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const rawData = await response.json();
      setMarketData(rawData);

      // Process the data for display based on timeRange
      setDisplayData(processDataForTimeRange(rawData, timeRange));
    } catch (err) {
      console.error(err);
      setError("Failed to load market data");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Process data based on the selected time range
   */
  const processDataForTimeRange = (data, range) => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    let cutoffDate = new Date();

    // Set cutoff date based on time range
    switch (range) {
      case "1W":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "3M":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case "YTD":
        cutoffDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 1); // Default to 1M
    }

    // Filter data based on cutoff date
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  /**
   * Summarize the most recent day (compared to prior day).
   */
  const calculateSummaryMetrics = () => {
    if (!displayData.length) return null;

    const latestDay = displayData[displayData.length - 1];
    const previousDay =
      displayData.length > 1 ? displayData[displayData.length - 2] : null;

    return {
      newHighs: latestDay.newHighs,
      newLows: latestDay.newLows,
      advanced: latestDay.advanced,
      declined: latestDay.declined,
      unchanged: latestDay.unchanged,
      adSpread: latestDay.adSpread,
      newHighsChange: previousDay
        ? latestDay.newHighs - previousDay.newHighs
        : 0,
      newLowsChange: previousDay ? latestDay.newLows - previousDay.newLows : 0,
      adSpreadChange: previousDay
        ? latestDay.adSpread - previousDay.adSpread
        : 0,
    };
  };

  const summaryMetrics = calculateSummaryMetrics();

  // Display the number of data points being shown
  const getDataPointsLabel = () => {
    if (!displayData.length) return "";
    return `Showing ${displayData.length} days of data`;
  };

  return (
    <>
  {currentUser && currentUser.username === "admin" && (
    <div className="flex flex-col space-y-4 p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Market Pulse Dashboard</h1>
        <div className="flex space-x-2">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {["1W", "1M", "3M", "YTD"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium border ${
                  timeRange === range
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                } ${range === "1W" ? "rounded-l-lg" : ""} ${
                  range === "YTD" ? "rounded-r-lg" : ""
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Display data points count */}
      {!isLoading && !error && displayData.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          {getDataPointsLabel()}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading market data...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* --- SUMMARY CARDS --- */}
          {summaryMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CARD 1: New Highs/Lows */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="pb-2 border-b">
                  <h3 className="text-base font-medium">New Highs/Lows</h3>
                </div>
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* New Highs */}
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold">
                        {summaryMetrics.newHighs}
                      </div>
                      <div className="flex items-center text-sm">
                        {summaryMetrics.newHighsChange > 0 ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-green-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-500">
                              +{summaryMetrics.newHighsChange}
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-red-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-red-500">
                              {summaryMetrics.newHighsChange}
                            </span>
                          </>
                        )}
                        <span className="ml-1 text-gray-500">New Highs</span>
                      </div>
                    </div>

                    {/* New Lows */}
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold">
                        {summaryMetrics.newLows}
                      </div>
                      <div className="flex items-center text-sm">
                        {summaryMetrics.newLowsChange > 0 ? (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-red-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-red-500">
                              +{summaryMetrics.newLowsChange}
                            </span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-green-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-green-500">
                              {summaryMetrics.newLowsChange}
                            </span>
                          </>
                        )}
                        <span className="ml-1 text-gray-500">New Lows</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: Advances/Declines */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="pb-2 border-b">
                  <h3 className="text-base font-medium">Advances/Declines</h3>
                </div>
                <div className="pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold">
                        {summaryMetrics.advanced}
                      </div>
                      <div className="flex items-center text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586l3.293-3.293A1 1 0 0114 7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-500">Advanced</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="text-2xl font-bold">
                        {summaryMetrics.declined}
                      </div>
                      <div className="flex items-center text-sm">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-red-500 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414l3.293 3.293A1 1 0 0014 13z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-500">Declined</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 3: A-D Spread */}
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="pb-2 border-b">
                  <h3 className="text-base font-medium">A-D Spread</h3>
                </div>
                <div className="pt-4">
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold">
                      {summaryMetrics.adSpread}
                    </div>
                    <div className="flex items-center text-sm">
                      {summaryMetrics.adSpreadChange > 0 ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-green-500 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-green-500">
                            +{summaryMetrics.adSpreadChange}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-500 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-red-500">
                            {summaryMetrics.adSpreadChange}
                          </span>
                        </>
                      )}
                      <span className="ml-1 text-gray-500">
                        from previous day
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- CHARTS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CHART 1: New Highs vs New Lows */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="border-b pb-2">
                <h3 className="font-medium">New Highs vs New Lows</h3>
              </div>
              <div className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displayData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newHighs"
                      stroke="#22c55e"
                      name="New Highs"
                    />
                    <Line
                      type="monotone"
                      dataKey="newLows"
                      stroke="#ef4444"
                      name="New Lows"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 2: Daily Rate of Change in New Highs */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="border-b pb-2">
                <h3 className="font-medium">
                  Daily Rate of Change in New Highs
                </h3>
              </div>
              <div className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="10 10" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="newHighRateOfChange"
                      fill="#3b82f6"
                      name="Rate of Change (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 3: Advance-Decline Line */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="border-b pb-2">
                <h3 className="font-medium">Advance-Decline Line</h3>
              </div>
              <div className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={displayData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulativeADLine"
                      stroke="#8884d8"
                      name="A-D Line"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CHART 4: Acceleration of New Highs */}
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="border-b pb-2">
                <h3 className="font-medium">Acceleration of New Highs</h3>
              </div>
              <div className="h-64 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="acceleration"
                      fill="#a855f7"
                      name="Acceleration"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* --- DATA TABLE (dynamically show appropriate number of records) --- */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="border-b pb-2 flex justify-between items-center">
              <h3 className="font-medium">Market Breadth Data</h3>
              <span className="text-sm text-gray-500">
                {timeRange === "1W"
                  ? "Last 7 days"
                  : timeRange === "1M"
                  ? "Last 30 days"
                  : timeRange === "3M"
                  ? "Last 90 days"
                  : "Year to date"}
              </span>
            </div>
            <div className="pt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Highs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        New Lows
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Advanced
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Declined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unchanged
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        A-D Spread
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayData
                      // Show data newest first, limit to max 15 rows for better UX
                      .slice(-Math.min(displayData.length, 15))
                      .reverse()
                      .map((day, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.newHighs}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.newLows}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.advanced}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.declined}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.unchanged}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {day.adSpread}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )}
  </>
  );
};

export default MarketPulseDashboard;
