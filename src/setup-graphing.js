import { csvRequest, VARIABLES, variableNames } from "./request-data.js";
import { displayGraph, drawGraph } from "./graphing.js";

function toggleGraphDisplay() {
  const toggle = document.getElementById("data-display-toggle");
    const graphDisplay = document.getElementById("graph-display");
    const bodypd = document.getElementById("container-fluid");
    const timepd = document.getElementById("timeControls");
    const pointerpd = document.getElementById("pointer");
    graphDisplay.classList.toggle("graph-display-hide");
    graphDisplay.classList.toggle("graph-display-show");
    bodypd.classList.toggle("container-fluid-pd-right");
    timepd.classList.toggle("timeRow-pd-right");
    pointerpd.classList.toggle("pointer-pd-right");
}

// create a random colour
function getRandomColor() {
  const letters = "0123456789AB";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 12)];
  }
  return color;
}

// get a new colour for a map marker and corresponding graph
export function getColor(index) {
  // named colors from https://matplotlib.org/3.5.0/tutorials/colors/colors.html
  const colorList = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

  if (index >= colorList.length) {
    return getRandomColor();
  }

  return colorList[index];
}

// setup graphing area and display graph when plot button is pressed
export function setupGraphing(world, shaderUniforms) {
  // hide graph display area when close button pressed
  const toggle = document.getElementById("data-display-toggle");
  toggle.addEventListener("click", toggleGraphDisplay);

  const plotButton = document.getElementById("pointer-plot");

  //Creates plotting options to display in the pointer dialogue
  const variableSelector = document.getElementById("variable-selector");
  for (let i = 0; i < variableNames.length; i++) {
    const opt = document.createElement("option");
    opt.value = i.toString();
    opt.innerHTML = variableNames[i];
    opt.classList.add("pointer-options");
    variableSelector.appendChild(opt);
  }

  //Add resize listener to re-render graph if screen width goes below/above cut-off
  window.addEventListener("resize", () => {
    Object.values(VARIABLES).forEach(v => {
      const id = "csv_graph_" + String(v);
      if (document.getElementById(id)) {
        drawGraph(id, v, world, shaderUniforms);
      }
    });
  });

  //When plot button is clicked, a new graph will be created and added into the graph display
  const graphDisplay = document.getElementById("graph-display");

  plotButton.addEventListener("click", async () => {
    const bodypd = document.getElementById("container-fluid");
    const timepd = document.getElementById("timeControls");
    const pointerpd = document.getElementById("pointer");

    //const pointerpd = document.getElementById("pointer");
    let variable = parseInt(document.getElementById("variable-selector").value);
    console.log(variable)
    if (!Object.values(VARIABLES).includes(variable)) {
      variable = VARIABLES.temp;
    }
    let newGraph = document.getElementById("csv_graph_" + String(variable));

    // create new graph container for the selected variable if it doesn't already exist
    if (newGraph == null) {
      const graphContainer = document.createElement("div");
      newGraph = document.createElement("div");
      newGraph.id = "csv_graph_" + String(variable);
      graphContainer.appendChild(newGraph);
      graphContainer.classList.add("graph-container");

      //Container for dowload options
      const buttonRow = document.createElement("div");
      buttonRow.classList.add("buttonRow");

      const toggleScaleButton = document.createElement("button");
      const toggleScaleIcon = document.createElement("i");
      toggleScaleIcon.classList.add("uil", "uil-compress-lines");
      toggleScaleButton.appendChild(toggleScaleIcon);
      toggleScaleButton.classList.add("btn","graph-btn", "graph-btn-toggle", "btn-primary" );
      toggleScaleButton.id = "toggle-scale" + String(variable);

      toggleScaleButton.addEventListener("click", function () {
        toggleScaleButton.classList.toggle("btn-primary");
        toggleScaleButton.classList.toggle("btn-outline-primary");
      });

      //Button to display download options
      const downloadButton = document.createElement("button");
      const downloadIcon = document.createElement("i");
      downloadIcon.classList.add("uil", "uil-download-alt");
      downloadButton.appendChild(downloadIcon);
      downloadButton.classList.add("btn", "graph-btn", "graph-btn-download", "btn-success");
      downloadButton.id = "download-graph" + String(variable);


      // button to download csv data of graph
      const downloadCsvButton = document.createElement("a");
      downloadCsvButton.innerHTML = "CSV";
      downloadCsvButton.classList.add("btn", "graph-btn", "graph-btn-group", "btn-outline-success" );
      downloadCsvButton.id = "csv-download" + String(variable);
      //downloadContainer.appendChild(downloadCsvButton);

      // button to download png image of graph
      const downloadPngButton = document.createElement("a");
      downloadPngButton.innerHTML = "PNG";
      downloadPngButton.classList.add("btn", "graph-btn","graph-btn-group", "btn-outline-success");
      downloadPngButton.id = "png-download" + String(variable);
      //downloadContainer.appendChild(downloadPngButton);

      // button to download svg image of graph
      const downloadSvgButton = document.createElement("a");
      downloadSvgButton.innerHTML = "SVG";
      downloadSvgButton.classList.add("btn","graph-btn", "graph-btn-group-end", "btn-outline-success");
      downloadSvgButton.id = "svg-download" + String(variable);
      //downloadContainer.appendChild(downloadSvgButton);

      //Button to delete graph component
      const deleteButton = document.createElement("button");
      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("uil", "uil-trash-alt");
      deleteButton.appendChild(deleteIcon);
      deleteButton.classList.add("btn", "graph-btn", "graph-btn-delete", "btn-outline-danger");
      deleteButton.id = "delete-graph" + String(variable);
      deleteButton.addEventListener("click", function () {
        graphDisplay.removeChild(graphContainer);
        if (graphDisplay.childElementCount <= 1) toggleGraphDisplay();
      });

      buttonRow.appendChild(toggleScaleButton);

      buttonRow.appendChild(downloadButton);
      buttonRow.appendChild(downloadCsvButton);
      buttonRow.appendChild(downloadPngButton);
      buttonRow.appendChild(downloadSvgButton);
      buttonRow.appendChild(deleteButton);

      //graphContainer.appendChild(downloadButton);

      // graphContainer.appendChild(downloadContainer);

      graphContainer.appendChild(buttonRow);

      graphDisplay.appendChild(graphContainer);
    }

    const { lat, lon, latPrecise, lonPrecise, modelID, intervalNameShort, intervalNameLong, source, color, locationID, markerTime, validAge, markerRotationFlag, showGraph, modernLat, modernLon } = JSON.parse(plotButton.getAttribute("plotObject"));

    // reconstruct modern marker location via GPlates Web Service
    //const [ modernLon, modernLat ] = await world.rotateToModern( - 1. * markerTime, latPrecise, lonPrecise)
    // const modernLon = -999
    // const modernLat = -999

    world.hideDummyMarker();

    world.addLocationMarker(world.scene, world.loop, world.rotationsDataImage, locationID, latPrecise, lonPrecise, modernLon, modernLat, shaderUniforms, color, markerTime, validAge, markerRotationFlag);
    
    displayGraph(newGraph.id, lat, lon, modelID, intervalNameShort, intervalNameLong, color, locationID, world, shaderUniforms, markerTime, source, modernLat, modernLon);

    if (showGraph) {
      document.getElementById("graph-display").style.display = "block";

      newGraph.scrollIntoView();
      if (!graphDisplay.classList.contains("graph-display-show")) {
        graphDisplay.classList.toggle("graph-display-hide");
        graphDisplay.classList.toggle("graph-display-show");
        bodypd.classList.toggle("container-fluid-pd-right");
        timepd.classList.toggle("timeRow-pd-right");
        pointerpd.classList.toggle("pointer-pd-right");
      }
    }
  });
}

// used to request data from the server when double clicking
export function requestData(lat, lon, latPrecise, lonPrecise, modelID, intervalNameShort, intervalNameLong, source, locationID, shaderUniforms, markerTime, validAge, markerRotationFlag, showGraph, modernLat, modernLon ) {
  // format annotations
  const labelTime = -markerTime;
  const latLabel = lat >= 0 ? lat + "°N" : -lat + "°S";
  const lonLabel = lon >= 0 ? lon + "°E" : -lon + "°W";
  
  document.getElementById("pointer-period").innerHTML = `${intervalNameLong}`;
  document.getElementById("pointer-age").innerHTML = `${labelTime} Ma`;
  document.getElementById("pointer-data").innerHTML = `${latLabel} / ${lonLabel}`;
  document.getElementById("pointer-reference").innerHTML = `Valdes et al (2021)`;

  console.log("csv request");
  csvRequest(latPrecise.toFixed(2), lonPrecise.toFixed(2), modelID);

  const plotButton = document.getElementById("pointer-plot");
  plotButton.setAttribute(
    "plotObject",
    JSON.stringify({
      lat: lat,
      lon: lon,
      latPrecise: latPrecise,
      lonPrecise: lonPrecise,
      modelID: modelID,
      intervalNameShort: intervalNameShort,
      intervalNameLong: intervalNameLong,
      source: source,
      color: getColor(parseInt(shaderUniforms.currentNumberOfMarkers.value)),
      locationID: locationID,
      markerTime: markerTime,
      validAge: validAge,
      markerRotationFlag: markerRotationFlag,
      showGraph: showGraph,
      modernLat: modernLat,
      modernLon: modernLon,
    })
  );

}
