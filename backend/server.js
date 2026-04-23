const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/contact", require("./routes/contactRoutes"));

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});