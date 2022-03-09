require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Express Server

const port = process.env.PORT;

const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send({ message: "Hello from Planner API!" });
});

var server = http.createServer(app);

server.listen(port, () => {
  console.log(`DogTinder WS-API listening on port ${port}`);
});
