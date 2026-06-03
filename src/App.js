function App() {

  const balance = 100000;
  const watchlist = [
    "AAPL",
    "TSLA",
    "NVDA",
    "MSFT"
  ];

  return (
    <div className="app">

      <h1>Paper Trading Dashboard</h1>

      <div className="dashboard-grid">

        <section className="card">
          <h2>Account Balance</h2>

          <p>${balance.toLocaleString()}</p>

        </section>

        <section className="card">
          <h2>Watchlist</h2>

          <ul>
            {watchlist.map((ticker) => (
              <li key={ticker}>
                {ticker}
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Portfolio</h2>
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