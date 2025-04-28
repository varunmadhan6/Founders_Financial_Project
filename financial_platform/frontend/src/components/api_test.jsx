import React, { useState } from "react";
import "./StockInfo.css";

const StockInfo = () => {
  const [stockSymbols, setStockSymbols] = useState("");
  const [stockData, setStockData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (num) => {
    if (num === "N/A" || num === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const symbols = stockSymbols
      .split(",")
      .map((symbol) => symbol.trim().toUpperCase());

    if (symbols.length === 0 || symbols[0] === "") {
      setError("Please enter at least one stock symbol");
      return;
    }

    setIsLoading(true);
    setError("");
    setStockData([]);

    try {
      const baseUrl = import.meta.env.API_URL;

      const response = await fetch(`${baseUrl}/stocks/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbols }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stock data");
      }

      // Fetch the updated stock data
      const stockResponse = await fetch(`${baseUrl}/stocks`);
      const stockData = await stockResponse.json();

      if (!stockResponse.ok) {
        throw new Error(
          stockData.error || "Failed to fetch updated stock data"
        );
      }

      // Ensure only requested symbols are displayed
      const filteredStocks = stockData.stocks.filter((stock) =>
        symbols.includes(stock.symbol)
      );

      // Add more robust error handling
      if (filteredStocks.length === 0) {
        setError("No stock data found for the given symbols");
      }

      setStockData(filteredStocks);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message || "Could not fetch data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="stock-container">
      <h1>Stock Information</h1>
      <form onSubmit={handleSearch} className="search-form">
        <div className="input-group">
          <input
            type="text"
            value={stockSymbols}
            onChange={(e) => setStockSymbols(e.target.value)}
            placeholder="Enter Stock Symbols (e.g., AAPL, MSFT, GOOGL)"
            className="stock-input"
          />
          <button type="submit" disabled={isLoading} className="search-button">
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {stockData.length > 0 && (
          <div className="stock-data-list">
            {stockData.map((stock, index) => (
              <div key={stock.symbol || index} className="stock-data">
                <h2>{stock.name || stock.symbol}</h2>
                <div className="data-grid">
                  <div className="data-item">
                    <span className="label">Symbol</span>
                    <span className="value">{stock.symbol}</span>
                  </div>
                  <div className="data-item">
                    <span className="label">Current Price</span>
                    <span className="value">
                      $
                      {typeof stock.price === "number"
                        ? stock.price.toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="data-item">
                    <span className="label">Market Cap</span>
                    <span className="value">
                      {formatNumber(stock.market_cap)}
                    </span>
                  </div>
                  <div className="data-item">
                    <span className="label">P/E Ratio</span>
                    <span className="value">
                      {typeof stock.pe_ratio === "number"
                        ? stock.pe_ratio.toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="data-item">
                    <span className="label">Dividend Yield</span>
                    <span className="value">
                      {typeof stock.dividend_yield === "number"
                        ? (stock.dividend_yield * 100).toFixed(2) + "%"
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default StockInfo;
