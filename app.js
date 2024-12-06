const express = require("express");
const mongoose = require("mongoose");
const handlerRoute = require("./routes/todoroutes.js");
const ConnectDB = require("./connect.js");
const path = require("path");

// Serve static files
const app = express();
// app.use(express.static(path.join(__dirname, "public")));

const cors = require('cors');

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true // if you're using cookies/sessions
};

// Apply CORS with the options
app.use(cors(corsOptions));

app.use(express.json());
app.use("/todos", handlerRoute);
// connecting to database.

ConnectDB("mongodb://localhost:27017/Lgg")
    .then(() => console.log("mongodb is connected"))
    .catch(console.error);


// connecting server on port
app.listen(4001, () => {
    console.log("server is running at port 4001");
})