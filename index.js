const express = require("express");
const app = express();
const axios = require("axios");
const staticData = require("./staticData");

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

const port = process.env.port || 5000;
const dataRoute =
  "https://04m8q6i6g2.execute-api.eu-central-1.amazonaws.com/dev/ekberga/2016/1";

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.get("/data", async (req, res) => {
  res.send(cleanData);
});

app.get("/data/usage", (req, res) => {
  const tempLevels = cleanData.map(item => {
    return {
      id: item.id,
      heatLevel: item.tempIn - item.tempOut
    };
  });

  res.send(tempLevels);
});

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
