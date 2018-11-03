const express = require("express");
const app = express();
const axios = require("axios");
const staticData = require("./staticData");
const cors = require("cors");

app.use(cors());

const cleanData = staticData.map(item => {
  return {
    id: item.id,
    time: item.timeofmetric,
    pressureIn: item.pframLedFVebSkolan,
    tempIn: item.tframledFVebSkolan,
    pressureOut: item.pReturFVebSkolan,
    tempOut: item.tReturFVebSkolan
  };
});

const tempLevels = cleanData.map(item => {
  return {
    id: item.id,
    heatLevel:
      item.tempIn - item.tempOut > 40
        ? "high"
        : item.tempIn - item.tempOut < 35
          ? "low "
          : "medium"
  };
});

function getUsageSum(total, num) {
  return total + num;
}

const port = process.env.port || 5000;
const dataRoute =
  "https://04m8q6i6g2.execute-api.eu-central-1.amazonaws.com/dev/ekberga/2016/1";

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.get("/:building", (req, res) => {
  res.send(cleanData);
});

app.get("/:building/levels", (req, res) => {
  res.send(tempLevels);
});

app.get("/:building/avg", (req, res) => {
  const usages = cleanData.map(item => item.tempIn - item.tempOut);

  res.send({ avg: usages.reduce(getUsageSum) / usages.length });
});

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
