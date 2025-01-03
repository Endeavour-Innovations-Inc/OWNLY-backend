// Import necessary libraries
const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Initialize dotenv to load environment variables from .env file
dotenv.config();

// Import the database connection function
const connectDB = require('./config/db');

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Apply rate limiting to API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});

// Middleware to parse JSON bodies
app.use(express.json());

// Apply the rate limiter to all requests under '/api'
app.use('/api', apiLimiter);

// Basic route for the root of the website
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server and listen on the configured port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
