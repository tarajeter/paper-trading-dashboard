const axios = require("axios");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});