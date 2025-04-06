import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Card = ({ children, className = "" }) => (
  <div className={`p-5 bg-white bg-opacity-80 rounded-2xl shadow-lg ${className}`}>{children}</div>
);

const PortfolioDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [searchSymbol, setSearchSymbol] = useState("");

  const fetchStockData = (symbol) => {
    fetch(`http://127.0.0.1:5000/stock/${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          setStocks((prevStocks) => {
            // Check if the stock already exists (using 'name' or a unique identifier like 'symbol')
            if (prevStocks.some((stock) => stock.name === data.name)) {
              return prevStocks; // Stock already exists; no update.
            }
            return [...prevStocks, data]; // Otherwise, add the new stock.
          });
          fetchHistoricalData(symbol);
        }
      })
      .catch((error) => console.error("Error fetching stock data:", error));
  };

  const fetchHistoricalData = (symbol) => {
    fetch(`http://127.0.0.1:5000/historical/${symbol}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.error) {
          setHistoricalData(data);
        }
      })
      .catch((error) => console.error("Error fetching historical data:", error));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchSymbol) {
      fetchStockData(searchSymbol);
      setSearchSymbol("");
    }
  };

  // Moved removeStock inside the component so it has access to state setters
  const removeStock = (stockName) => {
    setStocks((prevStocks) => prevStocks.filter((stock) => stock.name !== stockName));
    setHistoricalData((prevData) => {
      // Assuming historicalData is an object keyed by stock name.
      const newData = { ...prevData };
      delete newData[stockName];
      return newData;
    });
  };

  return (
    <div
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="grid grid-cols-2 gap-4 p-10 bg-black bg-opacity-60 h-full">
        {/* Stock Search - Fixed Height */}
        <Card className="h-40">
          <h2 className="text-xl font-bold mb-4">Search & Add Stock</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              className="p-2 border rounded w-full"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
              Add
            </button>
          </form>
        </Card>

        {/* Stock List - Scrollable Container */}
        <Card className="overflow-auto">
          <h2 className="text-xl font-bold mb-4">Stock Portfolio</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Stock</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 flex justify-between items-center">
                    <span>{stock.name}</span>
                  </td>
                  <td className="p-2">{stock.price}</td>
                  <td className={`p-2 ${stock.change?.includes("+") ? "text-green-500" : "text-red-500"}`}>
                    {stock.change || "N/A"}
                  </td>
                  <button
                      onClick={() => removeStock(stock.name)}
                      className="ml-2 text-red-500 hover:text-red-700 text-xs px-2 py-1"
                      title="Remove stock"
                    >
                      ✕
                    </button>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Graph */}
        <Card className="col-span-2">
          <h2 className="text-xl font-bold mb-4">Stock Value Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
