// Require necessary packages
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors"); // CORS middleware
const jwt = require("jsonwebtoken"); // JWT for token generation

// Initialize the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS to handle requests from different origins
app.use(express.static(path.join(__dirname, "public")));

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to the MySQL database");
});

// Route for the homepage (serve Home.html by default)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Home.html"));
});

// User Registration Route (Sign-up)
app.post("/registration", async (req, res) => {
  const {
    first_name,
    last_name,
    phone,
    experience,
    skills,
    username,
    email,
    password,
  } = req.body;

  // Validate the fields
  if (
    !first_name ||
    !last_name ||
    !phone ||
    !experience ||
    !skills ||
    !username ||
    !email ||
    !password
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store user in the database
    const query = `INSERT INTO users (first_name, last_name, phone, experience, skills, username, email, password_hash) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      query,
      [
        first_name,
        last_name,
        phone,
        experience,
        skills,
        username,
        email,
        hashedPassword,
      ],
      (err, result) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Database error", error: err });
        }
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error while registering user", error: err });
  }
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Query to check if username exists
  const query = "SELECT * FROM users WHERE username = ?";

  db.execute(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const user = results[0];

    // Compare password with hashed password
    bcrypt.compare(password, user.password_hash, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ success: false, message: "Server error" });
      }

      if (isMatch) {
        return res.json({ success: true, message: "Login successful" });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
