import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const API_URL = 
process.env.REACT_APP_API_URL || "http://localhost:5000";



function App() {


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
  const [sortBy, setSortBy] = useState("value");
  const [news, setNews] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);

  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);



  //useEffect(() => {
    //const savedData = localStorage.getItem("paperTradingData");

    //if (savedData) {
      //const data = JSON.parse(savedData);

     // setCashBalance(data.cashBalance || 100000);
     // setPositions(data.positions || []);
      //setTradeHistory(data.tradeHistory || []);
     // setWatchlist(data.watchlist || watchlist);
   // }

   // setHasLoadedSavedData(true);
 // }, []);

  //useEffect (() => {
   // if (!hasLoadedSavedData) return;

    //const data = {
     // cashBalance,
      //positions,
     // tradeHistory,
      //watchlist,
    //};

    //localStorage.setItem(
     // "paperTradingData",
     // JSON.stringify(data)
   // );
 // }, [
   // hasLoadedSavedData,
   // cashBalance,
    //positions,
   // tradeHistory,
   // watchlist,
 // ]);

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

  useEffect(() => {
    updateStockPrices();

    const interval = setInterval(() => {
      updateStockPrices();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    setPriceHistory([]);
  }, [selectedStock]);
 

  const addTicker = () => {
    if (!ticker.trim()) return;

    setWatchlist([
      ...watchlist,
      ticker.toUpperCase()
    ]);

    setTicker("");
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      axios
      .get(`${API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      })
      .then((response) => {
        setUser(response.data.user);
        loadPositions();
        loadTradeHistory();
        loadCashBalance();
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
    }
  }, []);

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

  const investedAmount = portfolioValue;

  const cashAllocation = 
  accountValue > 0 ? (cashBalance / accountValue) * 100 : 0;

  const investedAllocation =
  accountValue > 0 ? (investedAmount / accountValue) * 100 : 0;

  const winningPositions = positions.filter(
    (position) => position.currentPrice >= position.averagePrice
  ).length;

  async function savePosition(symbol, shares, purchasePrice) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/positions`,
        {
          symbol,
          shares,
          purchase_price: purchasePrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadPositions();
    } catch (error) {
      console.error("Failed to save position:", error);
    }
  }

  async function sellPosition(symbol, shares) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/positions/sell`,
        {
          symbol,
          shares,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadPositions();
    } catch (error) {
      console.error("Failed to sell position:", error);
      setErrorMessage(
        error.response?.data?.error || "Failed to sell position"
      );
    }
  }

  async function saveTrade(type, symbol, shares, price, total) {
    try {
      const token = localStorage.getItem("token");

      await axios.post(`${API_URL}/api/trades`, 
        {
          type,
          symbol,
          shares,
          price,
          total,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error saving trade:", error);
    }
  }

  async function handleTrade() {

    setErrorMessage("");

    const shares = Number(tradeShares);

    const stock = watchlist.find(
      (item) => item.symbol.trim().toUpperCase() === tradeSymbol.trim().toUpperCase()
    );

    console.log("Trade symbol:", tradeSymbol);
    console.log("Watchlist:", watchlist);
    console.log('Found stock:', stock);

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

    const newBalance = cashBalance - tradeCost;

    setCashBalance(newBalance);

    const token = localStorage.getItem("token");

    await axios.put(
      `${API_URL}/api/cash`,
      { cashBalance: newBalance },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    await savePosition(
      stock.symbol.toUpperCase(),
      shares,
      stock.price
    );

    await saveTrade(
      "BUY",
      stock.symbol,
      shares,
      stock.price,
      tradeCost
    );
    
    await loadTradeHistory();
  }

    else {
      const existingPosition = positions.find(
        (position) => position.symbol.trim().toUpperCase() === stock.symbol.trim().toUpperCase()
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

      const newBalance = cashBalance + saleTotal;

      setCashBalance(newBalance);

      const token = localStorage.getItem("token");

      await axios.put(
        `${API_URL}/api/cash`,
        { cashBalance: newBalance },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await sellPosition(
        stock.symbol.toUpperCase(),
        shares
      );

      await saveTrade(
        "SELL",
        stock.symbol,
        shares,
        stock.price,
        saleTotal
      );

      await loadTradeHistory();
    }

    

    setTradeSymbol("");
    setTradeShares("");
  }

  const sortedPositions = [...positions].sort((a, b) => {
    if (sortBy === "alphabetical") {
      return a.symbol.localeCompare(b.symbol);
    }

    if (sortBy === "profit") {
      const profitA =
      (a.currentPrice - a.averagePrice) * a.shares;

      const profitB =
      (b.currentPrice - b.averagePrice) * b.shares;

      return profitB - profitA;
    }

    if (sortBy === "allocation") {
      const allocA =
      (a.shares * a.currentPrice) / portfolioValue;

      const allocB =
      (b.shares * b.currentPrice) / portfolioValue;

      return allocB - allocA;
    }

    return (
      b.shares * b.currentPrice -
      a.shares * a.currentPrice
    );
  });


  async function updateStockPrices() {
    try {
      const updatedWatchlist = await Promise.all(
        watchlist.map(async (stock) => {
          const response = await axios.get(
            `${API_URL}/api/quote/${stock.symbol.trim()}`
          );

          return {
            ...stock,
            price: response.data.c,
            change: response.data.dp,
          };
        })
      );

      setWatchlist(updatedWatchlist);

      const selected = updatedWatchlist.find(
        (stock) => stock.symbol === selectedStock
      );

      if (selected) {
        setPriceHistory((currentHistory) => [
          ...currentHistory.slice(-19),
          {
            time: new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            }),
            price: selected.price,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchNews() {
    try {
      const response = await axios.get(
        `${API_URL}/api/news`
      );

      setNews(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPositions() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/positions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPositions(
        response.data.map((position) => ({
          symbol: position.symbol,
          shares: position.shares,
          averagePrice: position.purchase_price,
          currentPrice: position.purchase_price,
        }))
      );
    } catch (error) {
      console.error("Failed to load positions:", error);
    }
  }

  async function loadTradeHistory() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/trades`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      setTradeHistory(response.data);
    } catch (error) {
      console.error("Error loading trade history:", error);
    }
  }

  async function loadCashBalance() {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${API_URL}/api/cash`, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Cash response:", response.data);

      setCashBalance(response.data.cashBalance);
    } catch (error) {
      console.error("Failed to load cash balance:", error);
    }
  }

  async function handleLogin() {
    try {
      const response = await axios.post(
        `${API_URL}/api/login`,
        {
          email: loginEmail,
          password: loginPassword,
        }
      );

      localStorage.setItem("token", response.data.token);

      console.log("Token from login:", response.data.token);
      console.log("Stored token:", localStorage.getItem("token"));

      setUser(response.data.user);

      await loadPositions();
      await loadTradeHistory();
      await loadCashBalance();

      setAuthMessage("");
    } catch (error) {
      setAuthMessage("Invalid email or password");
    }
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Paper Trading Dashboard</h1>
          <p>Log in to access your trading workspace</p>

          <input
           type="email"
           placeholder="Email"
           value={loginEmail}
           onChange={(e) => setLoginEmail(e.target.value)}
          />

          <input
           type="password"
           placeholder="Password"
           value={loginPassword}
           onChange={(e) => setLoginPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Log In</button>

          {isRegistering ? (
            <>
            <h2>Create Account</h2>

            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            <button onClick={handleRegister}>
              Create Account
            </button>

            <button 
                className="text-button"
                onClick={() => setIsRegistering(false)}
              >
                ← Back to Login</button>  
           </>
          ) : (
            <div className="auth-footer">
              <button
                className="secondary-button"
                onClick={() => setIsRegistering(true)}
                >
                  Create Account
                </button>
            </div>
          )}

          {registerMessage && (
            <p>{registerMessage}</p>
          )}

          {authMessage && <p className="error-message">{authMessage}</p>} 
        </div>
      </div>
    );
  }

  async function handleRegister() {
    try {
      setRegisterMessage("");

      const response = await axios.post(
        `${API_URL}/api/register`,
        {
          email: registerEmail,
          password: registerPassword,
        }
      );

      setRegisterMessage(response.data.message);

      setRegisterEmail("");
      setRegisterPassword("");
    } catch (error) {
      setRegisterMessage(
        error.response?.data?.error || "Registration failed"
      );
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);

    setPositions([]);
    setTradeHistory([]);
    setCashBalance(100000);
  }

  const stockChartData = {
    lables: priceHistory.map((point) => point.time),
    datasets: [
      {
        label: selectedStock,
        data: priceHistory.map((point) => point.price),
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.2",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const stockChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "#1f2937",
        },
      },
      y: {
        ticks: {
          color: "#9ca3af",
        },
        grid: {
          color: "#1f2937",
        },
      },
    },
  };

  return (
    <div className="app">

      <h1>Paper Trading Dashboard</h1>

      <p className="auth-subtitle">
        Practice trading with simulated funds and live market data.
      </p>

      <button onClick={handleLogout}>Logout</button>

      <div className="dashboard-grid">

        <section className="card">

          <h2>Account Overview</h2>

          <div className="metrics-grid">
            <div className="metric-card">
              <span>Account Value</span>
              <strong>${accountValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</strong>
            </div>

            <div className="metric-card">
              <span>Cash</span>
              <strong>${cashBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</strong>
            </div>

            <div className="metric-card">
              <span>Portfolio Value</span>
              <strong>${portfolioValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</strong>
            </div>

            <div className="metric-card">
              <span>Total P/L</span>
              <strong className={totalProfitLoss >= 0 ? "profit" : "loss"}>
                ${totalProfitLoss.toFixed(2)}</strong>
            </div>

            <div className="metric-card">
              <span>Total Trades</span>
              <strong>{tradeHistory.length}</strong>
            </div>
          </div>
        </section>

        <section className="card chart-card">
          <h2>{selectedStock} Price Chart</h2>
          <p>Live price updates from your backend API</p>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={priceHistory}>
                <XAxis dataKey="time" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                 type="monotone"
                 dataKey="price"
                 stroke="#22c55e"
                 strokeWidth={3}
                 dot={false}
                 />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
        
        <section className="card">
          <h2>Portfolio Summary</h2>

          <div className="summary-grid">
            <div>
              <span>Invested</span>
              <strong>{investedAllocation.toFixed(1)}%</strong>
            </div>

            <div>
              <span>Cash</span>
              <strong>{cashAllocation.toFixed(1)}%</strong>
            </div>

            <div>
              <span>Winning Positions</span>
              <strong>
                {winningPositions}/{positions.length}
              </strong>
            </div>

            <div>
              <span>Total P/L</span>
              <strong className={totalProfitLoss >= 0 ? "profit" : "loss"}>
                ${totalProfitLoss.toFixed(2)}
              </strong>
            </div>
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
              <div 
              key={stock.symbol}
              className={
                selectedStock === stock.symbol
                ? "watchlist-row active-stock"
                : "watchlist-row"
              }
              onClick={() => setSelectedStock(stock.symbol)}
              >
                <div>
                  <strong>{stock.symbol}</strong>
                  <p>{stock.name}</p>
                </div>

                <div className="watchlist-price">
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
          <h2>Market News</h2>

          <div className="news-container">
            {news.map((article) => (
              <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="news-card"
              >
                <img
                src={article.image}
                alt={article.headline}
                />

                <div>
                  <h3>{article.headline}</h3>

                  <p>
                    {article.summary?.slice(0, 120)}...
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Portfolio</h2>

          <div className="sort-controls">
            <button onClick={() => setSortBy("value")}>
              Value
            </button>

            <button onClick={() => setSortBy("profit")}>
              Profit
            </button>

            <button onClick={() => setSortBy("allocation")}>
              Allocation
            </button>

            <button onClick={() => setSortBy("alphabetical")}>
              A-Z
            </button>
          </div>

          {positions.length === 0 ? (
            <p>No open positions</p>
          ) : (

              sortedPositions.map((position) => {

              const profitLoss =
              (position.currentPrice - position.averagePrice)*
              position.shares;

              const allocation =
              (position.shares * position.currentPrice /
                totalPortfolioValue) * 100;

              return (
              <div className={
                selectedStock === position.symbol
                ? "position-card active-position"
                : "position-card"
              }
              onClick={() => setSelectedStock(position.symbol)}
              >
                <div className="position-header">
                  <h3>{position.symbol}</h3>

                  <span className={profitLoss >= 0 ? "profit" : "loss"}>
                    ${profitLoss.toFixed(2)}
                  </span>
                </div>

                <div className="position-grid">
                  <p>Shares: <strong>{position.shares}</strong></p>
                  <p>Avg: <strong>${position.averagePrice.toFixed(2)}</strong></p>
                  <p>Value: <strong>${(position.shares * position.currentPrice).toFixed(2)}</strong></p>
                  <p>Allocation: <strong>{allocation.toFixed(1)}%</strong></p>
                </div>
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

          <div className="trade-toggle">
            <button
            className={tradeType === "buy" ? "toggle-active buy-toggle" : ""}
            onClick={() => setTradeType("buy")}
            >Buy
           </button>

            <button
            className={tradeType === "sell" ? "toggle-active sell-toggle" : ""}
            onClick={() => setTradeType("sell")}
            >Sell
           </button>
          </div>

         <div className="trade-form">  
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

          <button 
          className={tradeType === "buy" ? "submit-buy" : "submit-sell"}
          onClick={handleTrade}
          >
           {tradeType === "buy" ? "Buy Shares" : "Sell Shares"}
          </button>
         </div> 
        </section>

        <section className="card">
          <h2>Recent Trades</h2>

         {tradeHistory.length === 0 ? (
          <p>No trades yet</p>
         ) : (
          tradeHistory.map((trade, index) => (
            <div key={index} className="trade-row">

              <span className={trade.type === "BUY" ? "profit" : "loss"}>
                {trade.type}
              </span>

              <span>{trade.symbol}</span>
              <span>{trade.shares} shares</span>
              <span>${trade.price.toFixed(2)}</span>
              <span>${trade.total.toFixed(2)}</span>
            </div>
          )) 
         )}
        </section>
        
      </div>

    </div>
  );
}

export default App;