# Paper Trading Dashboard

A full-stack paper trading application that allows users to practice stock trading using simulated funds and live market data without risking real money.

The project was built to simulate the core workflow of a trading platform while providing hands-on experience building and deploying a full-stack React application.

## Live Demo

Frontend: https://paper-trading-dashboard-frontend.onrender.com

## Features

- User account registration and login
- Secure password hashing
- JWT-based authentication
- Persistent user sessions
- Simulated cash balance
- Stock watchlist
- Live stock market data
- Interactive stock charts
- Buy and sell simulated shares
- Portfolio position tracking
- Trade history
- Account-specific trading data
- Responsive trading dashboard
- Backend REST API connected to a database

## Tech Stack

### Frontend

- React
- JavaScript
- HTML
- CSS
- Axios
- Recharts

### Backend

- Node.js
- Express.js
- REST API
- JWT authentication
- bcryptjs

### Database

- SQLite

### External API

- Finnhub API for market data

### Development & Deployment

- Git
- GitHub
- Render
- Environment variables
- VS Code

## How It Works

The application is divided into a React frontend and an Express backend.

The React frontend manages the user interface, application state, stock data display, portfolio information, and communication with the backend.

Axios sends HTTP requests from the frontend to the Express REST API.

The backend handles authentication, user accounts, trading data, portfolio information, and communication with the SQLite database.

Protected routes use JSON Web Tokens (JWT) to verify authenticated users before returning account-specific information.

Market information is retrieved through the Finnhub API and displayed in the trading dashboard.

## Authentication Flow

1. A user creates an account with an email and password.
2. The backend hashes the password before storing it.
3. The user logs in with their credentials.
4. The backend verifies the credentials and generates a JWT.
5. The frontend stores the token and includes it in authenticated API requests.
6. The backend verifies the token before allowing access to protected user data.

## Trading Flow

When a user places a simulated trade:

1. The application identifies the selected stock and trade information.
2. The frontend sends the trade request to the backend.
3. The backend associates the trade with the authenticated user.
4. The trade is stored in the database.
5. Portfolio positions, trade history, and account information are updated.
6. The React interface updates to display the new trading state.

No real money or brokerage transactions are performed.

## API Configuration

Sensitive information such as the Finnhub API key and JWT secret is stored using environment variables rather than being committed to the repository.

The frontend also uses an environment variable to determine the deployed backend API URL while retaining localhost as a development fallback.

Example:

```javascript
const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";
```

Backend environment variables include:

```text
FINNHUB_API_KEY
JWT_SECRET
```

The `.env` file is excluded from Git using `.gitignore`.

## Database

SQLite is used to persist application data.

The database layer stores information associated with users and trading activity, allowing each authenticated account to maintain its own trading state.

The deployed backend connects to the SQLite database when the server starts.

## Security

The application includes several basic security practices:

- Passwords are hashed with bcryptjs before storage.
- Authentication is handled using JSON Web Tokens.
- Protected backend routes verify authentication tokens.
- API keys and authentication secrets are stored in environment variables.
- `.env` files are excluded from source control.
- Account-specific data is associated with authenticated users.

## Deployment

The application is deployed using Render.

The frontend and backend are deployed separately:

- The React frontend is deployed as a static site.
- The Node/Express backend is deployed as a web service.
- The frontend communicates with the deployed backend through the configured API URL.
- Production secrets are configured through Render environment variables.

The backend uses the port assigned by the hosting environment:

```javascript
const PORT = process.env.PORT || 5000;
```

This allows the same application to run locally on port 5000 while using Render's assigned port in production.

## What I Learned

Building this project provided hands-on experience with:

- Building a full-stack application with React and Node.js
- Designing frontend-to-backend communication
- Creating and consuming REST API endpoints
- Managing React state and effects
- Making asynchronous API requests with Axios
- Working with live external market data
- Creating interactive data visualizations
- Building user registration and login functionality
- Hashing and securely storing passwords
- Implementing JWT authentication
- Protecting backend routes
- Persisting user and trading data with SQLite
- Managing environment variables and API secrets
- Debugging frontend, backend, API, and database issues
- Using Git and GitHub to manage code changes
- Configuring an application for production deployment
- Deploying separate frontend and backend services
- Debugging production deployment issues

## Purpose

This project was created as a portfolio project and learning platform for practicing full-stack software development.

It demonstrates the ability to build an application that connects multiple layers of a modern web stack:

**React UI → HTTP requests → Express API → authentication → database → external market API**

The application is intended strictly for simulated trading and educational purposes.

## Disclaimer

This application is a paper trading simulator.

It does not execute real financial transactions, connect to brokerage accounts, or provide financial advice.
