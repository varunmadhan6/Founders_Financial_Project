import React, { useState } from 'react';
import './StockInfo.css';

const StockInfo = () => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (num) => {
    if (num === 'N/A' || num === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!stockSymbol.trim()) {
      setError('Please enter a stock symbol');
      return;
    }

    setIsLoading(true);
    setError('');
    setStockData(null);

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/getStockInfo?symbol=${stockSymbol.toUpperCase()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock data');
      }
      
      if (data.error) {
        throw new Error(data.error);
      }

      setStockData(data);
    } catch (error) {
      setError(error.message || 'Could not fetch data. Please try again.');
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
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value)}
            placeholder="Enter Stock Symbol (e.g., AAPL)"
            className="stock-input"
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="search-button"
          >
            {isLoading ? 'Loading...' : 'Search'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {stockData && (
          <div className="stock-data">
            <h2>{stockData.name}</h2>
            <div className="data-grid">
              <div className="data-item">
                <span className="label">Current Price</span>
                <span className="value">
                  ${typeof stockData.currentPrice === 'number' 
                    ? stockData.currentPrice.toFixed(2) 
                    : 'N/A'}
                </span>
              </div>
              <div className="data-item">
                <span className="label">Market Cap</span>
                <span className="value">{formatNumber(stockData.marketCap)}</span>
              </div>
              <div className="data-item">
                <span className="label">P/E Ratio</span>
                <span className="value">
                  {typeof stockData.peRatio === 'number' 
                    ? stockData.peRatio.toFixed(2) 
                    : 'N/A'}
                </span>
              </div>
              <div className="data-item">
                <span className="label">52 Week Range</span>
                <span className="value">
                  ${typeof stockData.week52Low === 'number' ? stockData.week52Low.toFixed(2) : 'N/A'} - 
                  ${typeof stockData.week52High === 'number' ? stockData.week52High.toFixed(2) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default StockInfo;