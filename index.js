const express = require("express");
const app = express();
const axios = require("axios");
const staticData = require("./staticData");
const cors = require("cors");

app.use(cors());

const useRealData = true;

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

const staticConsumptions = staticCleanData.map(
  item => item.tempIn - item.tempOut
);

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

    res.send(renderBuildingData(buildingData, building).splice(0, 100));
  } else {
    res.send(staticCleanData);
  }
});

app.get("/:building/levels", async (req, res) => {
  const { building } = req.params;

  if (useRealData) {
    const buildingData = await axios.get(dataRoute(building));

    const consumptionLevel = renderBuildingData(buildingData, building).map(
      item => {
        return {
          id: item.id,
          consumptionLevel:
            item.tempIn - item.tempOut > 40
              ? "high"
              : item.tempIn - item.tempOut < 35
                ? "low "
                : "medium"
        };
      }
    );

    res.send(consumptionLevel);
  } else {
    const staticConsumptionLevel = staticCleanData.map(item => {
      return {
        id: item.id,
        consumptionLevel:
          item.tempIn - item.tempOut > 40
            ? "high"
            : item.tempIn - item.tempOut < 35
              ? "low "
              : "medium"
      };
    });

    res.send(staticConsumptionLevel);
  }
});

app.get("/:building/avg", async (req, res) => {
  const { building } = req.params;

  const buildingData = await axios.get(dataRoute(building));

  const consumptions = buildingData.data.rows.map(
    item => item.tempIn - item.tempOut
  );

  res.send({
    avg: useRealData
      ? avgLevel(consumptions.reduce(getUsageSum) / consumptions.length)
      : avgLevel(
          staticConsumptions.reduce(getUsageSum) / staticConsumptions.length
        )
  });
});

app.get("/:building/avgPure", async (req, res) => {
  const { building } = req.params;

  const buildingData = await axios.get(dataRoute(building));

  const consumptions = buildingData.data.rows.map(
    item => item.tempIn - item.tempOut
  );

  res.send({
    avg: useRealData
      ? consumptions.reduce(getUsageSum) / consumptions.length
      : staticConsumptions.reduce(getUsageSum) / staticConsumptions.length
  });
});

app.listen(port, () => {
  console.log("Listening on port: ", port);
});
