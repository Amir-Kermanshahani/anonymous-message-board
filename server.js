"use strict";
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet"); // Added helmet for security headers
const connectDB = require("./db.js"); // MongoDB connection

const apiRoutes = require("./routes/api.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();


// Connect to MongoDB
connectDB();

// Security headers
app.use(helmet());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));

// Static assets
app.use("/public", express.static(process.cwd() + "/public"));

// CORS for FCC testing
app.use(cors({ origin: "*" }));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sample front-end routes
app.route("/b/:board/").get((req, res) => {
  res.sendFile(process.cwd() + "/views/board.html");
});

app.route("/b/:board/:threadid").get((req, res) => {
  res.sendFile(process.cwd() + "/views/thread.html");
});

// Index page
app.route("/").get((req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// FCC testing routes
fccTestingRoutes(app);

// API routes
apiRoutes(app);

// 404 handler
app.use((req, res, next) => {
  res.status(404).type("text").send("Not Found");
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        console.log("Tests are not valid:");
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; // for testing
