const axios = require("axios");
const express = require("express");
const cors = require("cors");
const db = require("./database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Access token required",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({
                error: "Invalid or expired token",
            });
        }

        req.user = user;
        next();
    });
}


app.get("/", (req, res) => {
    res.send("Paper trading API is running");
});

app.get("/api/quote/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;

        const response = await axios.get(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch stock data",
        });
    }
});

app.get("/api/news", async (req, res) => {
    try {
        const response = await axios.get(
            `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_API_KEY}`
        );

        res.json(response.data.slice(0, 10));
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch news",
        });
    }
});

app.get("/api/history/:symbol", async (req, res) => {
    try {
        const { symbol } = req.params;

        const to = Math.floor(Date.now() / 1000);
        const from = to - 60 * 60 * 24 * 7;

        const response = await axios.get(

    `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=60&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`
        );

        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);

        res.status(500).json({
            error: "Failed to fetch historical data",
            details: error.response?.data || error.message,
        });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run(
            "INSERT INTO users (email, password, cash_balance) VALUES (?, ?, ?)",
            [email, hashedPassword, 100000],
            function (error) {
                if (error) {
                    return res.status(400).json({
                        error: "User already exists",
                    });
                }

                res.status(201).json({
                    message: "User created successfully",
                    userID: this.lastID,
                });
            }
        );
    } catch (error) {
        res.status(500).json({
            error: "Registration failed",
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        db.get(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (error, user) => {
                if (error || !user) {
                    return res.status(401).json({
                        error: "Invalid credentials",
                    });
                }

                const validPassword = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!validPassword) {
                    return res.status(401).json({
                        error: "Invalid credentials",
                    });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        email: user.email,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "7d",
                    }
                );

                res.json({
                    message: "Login successful",
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                    },
                });
            }
        );
    } catch (error) {
        res.status(500).json({ 
            error: "Login failed",
        });
    }
});

app.get("/api/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Protected profile data",
        user: req.user,
    });
});

app.get("/api/cash", authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get(
        `
        SELECT cash_balance
        FROM users
        WHERE id = ?
        `,
        [userId],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    error: err.message,
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: "User not found",
                });
            }

            res.json({
                cashBalance: row.cash_balance ?? 100000,
            });
        }
    );
});

app.put("/api/cash", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { cashBalance } = req.body;

    db.run(
        `
        UPDATE users
        SET cash_balance = ?
        WHERE id = ?
        `,
        [cashBalance, userId],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message,
                });
            }

            res.json({
                message: "Cash balance updated",
            });
        }
    );
});

app.post("/api/positions", authenticateToken, (req, res) => {
    const { symbol, shares, purchase_price} = req.body;
    const userId = req.user.id;

    db.run(
        `INSERT INTO positions (user_id, symbol, shares, purchase_price)
         VALUES (?, ?, ?, ?)`,
         [userId, symbol, shares, purchase_price],
         function (error) {
            if (error) {
                console.error(error);

                return res.status(500).json({
                    error: error.message,
                });
            }

            res.status(201).json({
                message: "Position saved succcessfully",
                positionId: this.lastID,
            });
         }
     );
});

app.get("/api/positions", authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.all(
        "SELECT * FROM positions WHERE user_id = ?",
        [userId],
        (error, rows) => {
            if (error) {
                return res.status(500).json({
                    error: error.message,
                });
            }

            res.json(rows);
        }
    );
}) ;

app.post("/api/positions/sell", authenticateToken, (req, res) => {
    const { symbol, shares } = req.body;
    const userId = req.user.id;

    db.get(
        "SELECT * FROM positions WHERE user_id = ? AND symbol = ?",
        [userId, symbol],
        (error, position) => {
            if (error) {
                return res.status(500).json({ error: error.message });
            }

            if (!position) {
                return res.status(400).json({ error: "Position not found" });
            }

            if (shares > position.shares) {
                return res.status(400).json({ error: "Not enough shares to sell" });
            }

            const remainingShares = position.shares - shares;

            if (remainingShares === 0) {
                db.run(
                    "DELETE FROM positions WHERE id = ? AND user_id = ?",
                    [position.id, userId],
                    function (error) {
                        if (error) {
                            return res.status(500).json({ error: error.message});
                        }

                        res.json({ mesage: "Positio sold and removed"});
                    }
                );
            } else {
                db.run(
                    "UPDATE positions SET shares = ? WHERE id = ? AND user_id =?",
                    [remainingShares, position.id, userId],
                    function (error) {
                        if (error) {
                            return res.status(500).json({ error: error.message });
                        }

                        res.json({ message: "Position update after sale"});
                    }
                );
            }
        }
    );
});

app.get("/api/trades", authenticateToken, (req, res) => {
    db.all(
        `
        SELECT *
        FROM trades
        WHERE user_id = ?
        ORDER BY trade_date DESC
        `,
        [req.user.id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message,
                });
            }

            res.json(rows);
        }
    );
});

app.post("/api/trades", authenticateToken, (req, res) => {
    const { type, symbol, shares, price, total } = req.body;

    db.run(
        `
        INSERT INTO trades
        (user_id, type, symbol, shares, price, total)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            req.user.id,
            type,
            symbol.toUpperCase(),
            shares,
            price,
            total,
        ],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Trade saved successfully",
                id: this.lastID,
            });
        }
    );
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});