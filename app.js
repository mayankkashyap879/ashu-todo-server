const express = require("express");
const mongoose = require("mongoose");
const handlerRoute = require("./routes/todoroutes.js");
const ConnectDB = require("./connect.js");
const path = require("path");
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS options
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

// Apply CORS with the options
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use("/todos", handlerRoute);

app.get('/health', (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState === 1) {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date(),
                uptime: process.uptime(),
                mongoConnection: 'connected'
            });
        } else {
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date(),
                mongoConnection: 'disconnected'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date(),
            error: error.message
        });
    }
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Lgg';
ConnectDB(MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => {
        console.error("MongoDB connection error:", err);
        process.exit(1); // Exit process with failure
    });

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});