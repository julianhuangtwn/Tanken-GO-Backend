const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const authRoutes = require("../src/auth/register"); 
// const passport = require('passport');
// const authenticate = require('./auth');

const { createErrorResponse } = require('./response');

// Able to create logs
const logger = require('./logger');
const pino = require('pino-http')({
  // Use our default logger instance, which is already configured
  logger,
});

// Create an express app instance we can use to attach middleware and HTTP routes
const app = express();
app.use(cors({ origin: "https://tanken-go-frontend.vercel.app" }));
// Use pino logging middleware
app.use(pino);

// Helps secure Express applications by setting various HTTP headers that protect against common web vulnerabilities
app.use(helmet());

// Use CORS middleware so we can make requests across origins
app.use(cors());

// Reduces the size of the response, speeding up the load time for clients and reducing the bandwidth
app.use(compression());
app.use(express.json());
// // Set up our passport authentication middleware
// passport.use(authenticate.strategy());
// app.use(passport.initialize());

app.use(express.json());  // Middleware to parse JSON bodies

app.use('/', require('./routes'));
app.use("/auth", authRoutes); ///

// Add 404 middleware to handle any requests for resources that can't be found
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'Not Found'));
});

// Add error-handling middleware to deal with anything else
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Unable to process request';

  // If this is a server error, log something so we can see what's going on.
  if (status > 499) {
    logger.error({ err }, `Error processing request (server)`);
  }

  res.status(status).json(
    res.status(500).json(createErrorResponse(status, message))
  );
});

// Export `app` for server.js
module.exports = app;