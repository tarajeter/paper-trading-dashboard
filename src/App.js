import { useState } from "react";
import "./App.css";

function App() {

  const balance = 100000;

  const [watchlist, setWatchlist] = useState([
  { symbol: "AAPL", name: "Apple", price: 210.25, change: 1.2 },
  { symbol: "MSFT", name: "Microsoft", price: 445.10, change: -0.4 },
  { symbol: "NVDA", name: "NVIDIA", price: 125.55, change: 2.1 },
  { symbol: "TSLA", name: "Tesla", price: 182.30, change: -1.7 }
]);

  const [ticker, setTicker] = useState("");
  const [cashBalance, setCashBalance] = useState(100000);
  const [positions, setPositions] = useState([
    {
      symbol: "AAPL",
      shares: 10,
      averagePrice: 200,
      currentPrice: 210.25,
    },
  ]);


  const addTicker = () => {
    if (!ticker.trim()) return;

    setWatchlist([
      ...watchlist,
      ticker.toUpperCase()
    ]);

    setTicker("");
  }

  const newStock = {
    symbol: ticker.toUpperCase(),
    name: "Custom Stock",
    price: 100,
    change: 0
  };

  const portfolioValue = positions.reduce((total, position) => {
    return total + position.shares * position.currentPrice;
  }, 0);

  const accountValue = cashBalance + portfolioValue;

  return (
    <div className="app">

      <h1>Paper Trading Dashboard</h1>

      <div className="dashboard-grid">

        <section className="card">
          <h2>Account Balance</h2>

          <p className="balance-main">${accountValue.toLocaleString()}</p>

          <p>Cash: ${cashBalance.toLocaleString()}</p>

          <p>Portfolio Value: ${portfolioValue.toLocaleString()}</p>

        </section>

        <section className="card">
          <h2>Watchlist</h2>

          <input 
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter ticker"
          />

          <button onClick={addTicker}>Add</button>

          <ul>{watchlist.map((stock) => (
            <li key={stock.symbol}>
              {stock.symbol}
            </li>
          ))}
         </ul>
        </section>

        <section className="card">
          <h2>Portfolio</h2>

          {positions.length === 0 ? (
            <p>No open positions</p>
        ) : (
          <ul>
            {positions.map((position) => (
              <li key={position.symbol}>
                {position.symbol} - {position.shares} shares
              </li>
            ))}
          </ul>
        )}
        </section>

        <section className="card">
          <h2>Trade Entry</h2>
        </section>

        <section className="card">
          <h2>Recent Trades</h2>
        </section>
        
      </div>

    </div>
  );
}

export default App;