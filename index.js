require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

// Express Server

const port = process.env.PORT;

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Hello from Planner API!" });
});

var server = http.createServer(app);

server.listen(port, () => {
  console.log(`Planner API listening on port ${port}`);
});
