import { useState, useEffect } from "react";
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

  const [tradeSymbol, setTradeSymbol] = useState("");
  const [tradeShares, setTradeShares] = useState("");
  const [tradeHistory, setTradeHistory] = useState([]);
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [tradeType, setTradeType] = useState("buy");
  const [hasLoadedSavedData, setHasLoadedSavedData] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  useEffect(() => {
    const savedData = localStorage.getItem("paperTradingData");

    if (savedData) {
      const data = JSON.parse(savedData);

      setCashBalance(data.cashBalance || 100000);
      setPositions(data.positions || []);
      setTradeHistory(data.tradeHistory || []);
      setWatchlist(data.watchlist || watchlist);
    }

    setHasLoadedSavedData(true);
  }, []);

  useEffect (() => {
    if (!hasLoadedSavedData) return;

    const data = {
      cashBalance,
      positions,
      tradeHistory,
      watchlist,
    };

    localStorage.setItem(
      "paperTradingData",
      JSON.stringify(data)
    );
  }, [
    hasLoadedSavedData,
    cashBalance,
    positions,
    tradeHistory,
    watchlist,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist((currentWatchlist) =>
      currentWatchlist.map((stock) => {
        const priceChange = (Math.random() - 0.5) * 2;

        return {
          ...stock,
          price: Math.max(1, stock.price + priceChange),
          change: priceChange,
        };
      })
     );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setPositions((currentPositions) =>
    currentPositions.map((position) => {
      const matchingStock = watchlist.find(
        (stock) => stock.symbol === position.symbol
      );

      if (matchingStock) return position;

      return {
        ...position,
        currentPrice: matchingStock.price,
      };
    })
  );
  }, [watchlist]);


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

  const totalCostBasis = positions.reduce((total, position) => {
    return total + position.averagePrice * position.shares;
  }, 0);

  const totalProfitLoss = portfolioValue - totalCostBasis;

  const totalPortfolioValue = positions.reduce(
    (total, position) =>
      total + position.shares * position.currentPrice,
    0
  );

  const chartData = [
    100000,
    100350,
    100120,
    100900,
    101400,
    101100,
    accountValue,
  ];

  function handleTrade() {

    setErrorMessage("");

    const shares = Number(tradeShares);

    const stock = watchlist.find(
      (item) => item.symbol === tradeSymbol.toUpperCase()
    );

    if (!stock) {
      setErrorMessage("Ticker not found"); 
      return; 
    }

    if (shares <= 0) {
      setErrorMessage("Enter a valid share amount");
      return;
    }

    const tradeCost = shares * stock.price;

   if (tradeType === "buy") { 
    if (tradeCost > cashBalance) {
      setErrorMessage("Not enough cash available");
      return;
    }

    setCashBalance(cashBalance - tradeCost);

    const existingPosition = positions.find(
      (position) => position.symbol === stock.symbol
    );

    if (existingPosition) {
      const updatedPositions = positions.map((position) => {
        if (position.symbol === stock.symbol) {
          const totalShares = position.shares + shares;

          const totalCost =
          position.averagePrice * position.shares +
          stock.price * shares;

          return {
            ...position,
            shares: totalShares,
            averagePrice: totalCost / totalShares,
            currentPrice: stock.price,
          };
        }

        return position;
      });

      setPositions(updatedPositions);
    } else {
      const newPosition = {
        symbol: stock.symbol,
        shares,
        averagePrice: stock.price,
        currentPrice: stock.price,
      };

      setPositions([...positions, newPosition]);
    }

    const newTrade = {
      type: "BUY",
      symbol: stock.symbol,
      shares,
      price: stock.price,
      total: tradeCost,
    };

    setTradeHistory([...tradeHistory, newTrade]);
  }

    else {
      const existingPosition = positions.find(
        (position) => position.symbol === stock.symbol
      );

      if (!existingPosition) {
        setErrorMessage("You do not own this stock");
        return;
      }

      if (shares > existingPosition.shares) {
        setErrorMessage("Not enough shares to sell");
        return;
      }

      const saleTotal = shares * stock.price;

      setCashBalance(cashBalance + saleTotal);

      const updatedPositions = positions
      .map((position) => {
        if (position.symbol === stock.symbol) {
          return {
            ...position,
            shares: position.shares - shares,
          };
        }

        return position;
      })
      .filter((position) => position.shares > 0);

      setPositions(updatedPositions);
      
      const newTrade = {
        type: "SELL",
        symbol: stock.symbol,
        shares,
        price: stock.price,
        total: saleTotal,
      };

      setTradeHistory([...tradeHistory, newTrade]);

    }

    setTradeSymbol("");
    setTradeShares("");
  }

  return (
    <div className="app">

      <h1>Paper Trading Dashboard</h1>

      <div className="dashboard-grid">

        <section className="card">

          <h2>Account Overview</h2>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>Account Value</span>
              <strong>${accountValue.toLocaleString()}</strong>
            </div>

            <div className="metric-card">
              <span>Cash</span>
              <strong>${cashBalance.toLocaleString()}</strong>
            </div>

            <div className="metric-card">
              <span>Portfolio Value</span>
              <strong>${portfolioValue.toLocaleString()}</strong>
            </div>

            <div className="metric-card">
              <span>Total P/L</span>
              <strong className={totalProfitLoss >= 0 ? "profit" : "loss"}>
                ${totalProfitLoss.toFixed(2)}</strong>
            </div>

            <div className="metric-card">
              <span>Total Trades</span>
              <strong>${tradeHistory.length}</strong>
            </div>
          </div>
        </section>

        <section className="card chart-card">
          <div className="section-header">
            <div>
              <h2>Portfolio Performance</h2>
              <p>Simulated account value trend</p>
            </div>

            <span className={totalProfitLoss >= 0 ? "profit" : "loss"}>
              {totalProfitLoss >= 0 ? "+" : ""}
              ${totalProfitLoss.toFixed(2)}
            </span>
          </div>

          <div className="chart-placeholder">
            {chartData.map((value, index) => (
              <div
               key={index}
               className="chart-bar"
               style={{height: `${Math.max(20, (value / accountValue) * 120)}px`,
              }}
              ></div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Watchlist ({watchlist.length})</h2>

          <input 
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter ticker"
          />

          <button onClick={addTicker}>Add</button>

          <div className="watchlist">
            {watchlist.map((stock) => (
              <div key={stock.symbol} className="watchlist-row">
                <div>
                  <strong>{stock.symbol}</strong>
                  <p>{stock.name}</p>
                </div>

                <div>
                  <strong>${stock.price.toFixed(2)}</strong>
                  <p className={stock.change >= 0 ? "profit" : "loss"}>
                    {stock.change >= 0 ? "+" : ""}
                    {stock.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          
        </section>

        <section className="card">
          <h2>Portfolio</h2>

          {positions.length === 0 ? (
            <p>No open positions</p>
          ) : (

            positions.map((position) => {

              const profitLoss =
              (position.currentPrice - position.averagePrice)*
              position.shares;

              const allocation =
              (position.shares * position.currentPrice /
                totalPortfolioValue) * 100;

              return (
              <div key={position.symbol} className="position-card">

                <h3>{position.symbol}</h3>

                <p>Shares: {position.shares}</p>

                <p>
                  Avg Price: $
                  {position.averagePrice.toFixed(2)}
                </p>

                <p>
                  Market Value: $
                  {(position.shares * position.currentPrice).toFixed(2)}
                </p>

                <p className={profitLoss >= 0 ? "profit" : "loss"}>
                  Profit/Loss: ${profitLoss.toFixed(2)}
                </p>

                <p>Allocation: {allocation.toFixed(1)}%
                </p>

              </div>
              );
          })
        )} 
        </section>

        <section className="card">
          <h2>Trade Entry</h2>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          <select
          value={tradeType}
          onChange={(e) => setTradeType(e.target.value)}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>

          <input
          type="text"
          placeholder="Ticker"
          value={tradeSymbol}
          onChange={(e) => setTradeSymbol(e.target.value)}
          />

          <input 
          type="number"
          placeholder="Shares"
          value={tradeShares}
          onChange={(e) => setTradeShares(e.target.value)}
          />

          <button onClick={handleTrade}>
           Submit Trade
          </button>

        </section>

        <section className="card">
          <h2>Recent Trades</h2>

         {tradeHistory.length === 0 ? (
          <p>No trades yet</p>
         ) : (
          tradeHistory.map((trade, index) => (
            <div key={index} className="trade-row">
              <span>{trade.type} {trade.symbol}</span>
              <span>{trade.shares} shares</span>
              <span>${trade.price.toFixed(2)}</span>
              <span>Total: ${trade.total.toFixed(2)}</span>
            </div>
          )) 
         )}
        </section>
        
      </div>

    </div>
  );
}

export default App;