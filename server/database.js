const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./paper_trading.db", (error) => {
    if (error) {
        console.error("Database connection error:", error.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    cash_balance REAL DEFAULT 100000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);


db.run(`
    CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    symbol TEXT,
    shares INTEGER,
    purchase_price REAL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT NOT NULL,
    symbol TEXT NOT NULL,
    shares INTEGER NOT NULL,
    price REAL NOT NULL,
    total REAL NOT NULL,
    trade_date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  module.exports = db;