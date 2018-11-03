const express = require("express");
const app = express();
const axios = require("axios");
const staticData = require("./staticData");
const cors = require("cors");

app.use(cors());

const useRealData = false;

const staticCleanData = staticData.map(item => {
  return {
    id: item.id,
    time: item.timeofmetric,
    pressureIn: item.pframLedFVebSkolan,
    tempIn: item.tframledFVebSkolan,
    pressureOut: item.pReturFVebSkolan,
    tempOut: item.tReturFVebSkolan
  };
});

const tempLevels = staticCleanData.map(item => {
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

function avgLevel(avg) {
  if (avg > 40) {
    return "high";
  } else if (avg < 35) {
    return "low";
  } else {
    return "medium";
  }
}

const port = 8080;

function dataRoute(building) {
  let authToken = "";

  if (building === "ekberga") {
    authToken = "04m8q6i6g2";
  } else if (building === "trollback") {
    authToken = "44gm5pbsl2";
  }

  return `https://${authToken}.execute-api.eu-central-1.amazonaws.com/dev/${building}/2016/1`;
}

function renderBuildingData(buildingData, building) {
  return buildingData.data.rows.map(item => {
    if (building === "ekberga") {
      return {
        id: item.id,
        time: item.timeofmetric,
        pressureIn: item.pframLedFVebSkolan,
        tempIn: item.tframledFVebSkolan,
        pressureOut: item.pReturFVebSkolan,
        tempOut: item.tReturFVebSkolan
      };
    } else {
      return {
        id: item.id,
        time: item.timeofmetric,
        pressureIn: item.pFramledFVtbSkolan,
        tempIn: item.tFramledFVtbSkolan,
        pressureOut: item.pReturFVtbSkolan,
        tempOut: item.tReturFVtbSkolan
      };
    }
  });
}

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

app.get("/:building", async (req, res) => {
  const { building } = req.params;

  if (useRealData) {
    const buildingData = await axios.get(dataRoute(building));

    res.send(renderBuildingData(buildingData, building));
  } else {
    res.send(staticCleanData);
  }
});

app.get("/:building/levels", (req, res) => {
  res.send(tempLevels);
});

app.get("/:building/avg", (req, res) => {
  const usages = staticCleanData.map(item => item.tempIn - item.tempOut);

  res.send({
    avg: avgLevel(usages.reduce(getUsageSum) / usages.length)
  });
});

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
