const d3 = require("d3");
import { getData, VARIABLES, MONTHS, variableNames, yLabels, units, unitsPlain, absoluteYRanges } from "./request-data.js";

// set the dimensions and margins of the graph
let margin = { top: 0, right: 20, bottom: 50, left: 55 };
let svgWidth;
let svgHeight;
let width;
let height;
let fontSize;
let legendHeight;

export const screenCutoff = 769;

// 2D array, one array for each variable containing all data for that variable
// data entry: { data: [], location: "", color: "" }
const dataPoints = Array.from({ length: Object.keys(VARIABLES).length }, () => []);

// whether to use a relative or absolute scale for each variable
const relativeScale = Array.from({ length: Object.keys(VARIABLES).length }, () => true);

// set the graph dimensions based on the font size and number of data points
function setDimensions(variable) {
  fontSize = Number(window.getComputedStyle(document.body).getPropertyValue("font-size").match(/\d+/)[0]);
  legendHeight = 1.8 * fontSize;
  const totalLegendHeight = legendHeight * dataPoints[variable].length;
  margin.top = 25 + totalLegendHeight;
  svgWidth = window.innerWidth <= screenCutoff ? window.innerWidth * 1. * 0.96 : window.innerWidth * 0.333 * 0.96;
  svgHeight = window.innerHeight * 0.4 + totalLegendHeight - legendHeight;
  width = svgWidth - margin.left - margin.right;
  height = svgHeight - margin.top - margin.bottom;
}

// clear all data points for one variable
function resetData(variable, world, shaderUniforms) {
  // remove all associated markers on map
  for (let i = 0; i < dataPoints[variable].length; i++) {
    const idToRemove = dataPoints[variable][i].locationID;
    world.removeLocationMarker(world.scene, idToRemove, shaderUniforms);
  }

  dataPoints[variable].splice(0, dataPoints[variable].length);
}

// create csv string containing all data from a graph
function graphDataToCsv(variable) {
  const data = dataPoints[variable].map((d) => d.data);
  // const labels = dataPoints[variable].map((d) => d.data);
  const period = dataPoints[variable].map((d) => d.legendLabel1);
  const age = dataPoints[variable].map((d) => d.markerTime);
  const lat = dataPoints[variable].map((d) => d.lat);
  const lon = dataPoints[variable].map((d) => d.lon);
  const modernLat = dataPoints[variable].map((d) => d.modernLat);
  const modernLon = dataPoints[variable].map((d) => d.modernLon);
  const source = dataPoints[variable].map((d) => d.source);
  const annualMean = dataPoints[variable].map((d) => d.annualMean);

  const months = MONTHS.map((m) => d3.timeFormat("%b")(m));

  // title line
  const csv = [["Valdes et al (2021) model data (Foster CO2 simulations) extracted via climatearchive.org"]];

  const constBetaWarning1 = [["WARNING: Data download functionality is still under development and behaviour might change in the future without notice! "]];
  const constBetaWarning2 = [["WARNING: Data should not be used for any publications without independent verification! "]];
  const constBetaWarning3 = [[""]];

  csv.push(constBetaWarning1);
  csv.push(constBetaWarning2);
  csv.push(constBetaWarning3);

  // header line
  const header = [["Number", "Age [Ma]", "Stratigraphic Description", "Modern Latitude [degN]", "Modern Longitude [degE]", "Paleo Latitude [degN]", "Paleo Longitude [degE]", "Variable", "Unit", "Annual Mean", ...months, "source"]]
  csv.push(header);

  for (let i = 0; i < data.length; i++) {

    const dataFixed = data[i].map(a => a.toFixed(1));

    const dataLine = [[i+1, age[i] * -1., period[i], modernLat[i], modernLon[i], lat[i], lon[i], variableNames[variable], unitsPlain[variable], annualMean[i].toFixed(1), ...dataFixed, source[i]]];
    csv.push(dataLine);

  }

  return csv.map((line) => line.join(",")).join("\n");
}

// create blank svg object to contain graph
function createSvg(id, variable) {
  // append the svg object to the body of the page
  setDimensions(variable);
  document.getElementById(id).innerHTML = "";
  const svg = d3.select("#" + id)
    .append("svg")
    .style("max-width", "100%")
    .style("max-height", "40%")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  // set white background
  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white");

  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return svg;
}

// create the axes and grid background
function createAxes(variable) {
  const x = d3.scaleTime()
    .domain(d3.extent(MONTHS))
    .range([0, width]);
  const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b"));

  const relativeDomain = d3.extent(dataPoints[variable].map((d) => d.data).flat());
  // extend yAxis to slightly higher and lower values
  const yRange = relativeDomain[1] - relativeDomain[0]
  relativeDomain[0] = relativeDomain[0] - 0.08 * yRange
  relativeDomain[1] = relativeDomain[1] + 0.08 * yRange

  const absoluteDomain = absoluteYRanges[variable] || relativeDomain;
  let domain;
  if (relativeScale[variable]) {
    domain = relativeDomain;
  } else {
    domain = [
      Math.min(relativeDomain[0], absoluteDomain[0]),
      Math.max(relativeDomain[1], absoluteDomain[1])
    ];
  }

  const y = d3.scaleLinear().domain(domain).range([height, 0]);
  const yAxis = d3.axisLeft(y);

  const xAxisGrid = d3.axisBottom(x).tickSize(-height).tickFormat("");
  const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat("");

  return [x, y, xAxis, yAxis, xAxisGrid, yAxisGrid];
}

// append axes, grid and labels to graph
function appendAxes(svg, variable, xAxis, yAxis, xAxisGrid, yAxisGrid, source) {

  // add grid
  const gridColor = "lightgrey";
  // svg.append("g")
  //   .attr("color", gridColor)
  //   .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
  //   .call(xAxisGrid);
  svg.append("g")
    .attr("color", gridColor)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(yAxisGrid);

  // add x axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top + height})`)
    .call(xAxis);

  // add y axis
  svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(yAxis);

  // add x axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x",  ( svgWidth - margin.right + margin.left ) / 2. )
    .attr("y", svgHeight - 17)
    .attr("font-size", "0.9em")
    .text("calendar month");

  // add y axis label
  svg.append("text")
    .attr("text-anchor", "middle")
    .text(yLabels[variable] + " [" + units[variable] + "]" || "Unknown")
    .attr("transform", `rotate(-90)`)
    .attr("font-size", "0.9em")
    .attr("y", 3)
   .attr("x", (- svgHeight - margin.top + margin.bottom ) / 2.  )
    .attr("dy", "1em");
    

  // add source in title
  svg.append("text")
  .attr("text-anchor", "start")
  .attr("x", 20)
  .attr("y", svgHeight - 4)
  // .attr("transform", `translate(0, ${margin.top})`)
  .attr("font-size", "0.8em")
  .attr("fill", "gray")
  // .text(source);
  .text("source: Valdes et al (2021)");

  // add watermark
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", svgWidth - 20)
 //   .attr("y", margin.top + height - 4)
    .attr("y", svgHeight - 4 )
    .attr("font-size", "0.8em")
    .attr("fill", "gray")
    .text("climatearchive.org");
    
}

// append paths and circles to graph
function appendPaths(svg, variable, x, y) {
  for (const [i, point] of dataPoints[variable].entries()) {
    const data = point.data;
    const color = point.color;
    // add path
    svg.append("path")
      .datum(data)
      .attr("id", `path${variable}_${i}`)
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3.0)
      .attr("d", d3.line()
        .x(function (d, i) { return x(MONTHS[i]); })
        .y(y)
      );

    // add circles to path
    svg.selectAll()
      .data(data)
      .enter()
      .append("circle")
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("fill", color)
      .attr("stroke", "none")
      .attr("cx", function (d, i) { return x(MONTHS[i]); })
      .attr("cy", y)
      .attr("r", 3);
  }
}

// append legend to graph
function appendLegend(svg, id, variable, world, shaderUniforms) {
  const points = dataPoints[variable].length;
  for (let i = 0; i < points; i++) {
    const y = margin.top + 8 - legendHeight * (points - i);
    const line = d3.select(`#path${variable}_${i}`);
    const color = line.attr("stroke");
    const legend = svg.append("g");

    // add rectangle
    const x = margin.left - 10;
    const w = 40;
    const h = 5;
    legend.append("rect")
      .attr("width", w)
      .attr("height", h)
      .attr("x", x)
      .attr("y", y - 0.5 * fontSize)
      .attr("fill", color);

    // add first line of label
    legend.append("text")
      .attr("text-anchor", "left")
      .attr("font-size", "0.85em")
      .attr("x", x + w + 10)
      .attr("y", y - 6)
      .text(dataPoints[variable][i].legendLabel1)
  
    // add first line of label
    legend.append("text")
    .attr("text-anchor", "left")
    .attr("x", x + w + 10)
    .attr("y", y + 6)
    .attr("font-size", "0.75em")
    .attr("fill", "gray")
    .text(dataPoints[variable][i].legendLabel2)

    // hovering over legend
    legend.on("mouseover", () => {
      // increase line width
      line.attr("stroke-width", 5.);
      var sel = d3.select(this);
      line.raise();
      // go to time period of data
      world.goToTime(dataPoints[variable][i].markerTime);

      // focus camera on marker
      world.goToPlace(world.controls, dataPoints[variable][i].lat, dataPoints[variable][i].lon, shaderUniforms);
    });
    legend.on("mouseout", () => line.attr("stroke-width", 3.0));

    // delete data point when legend is clicked and redraw graph
    legend.on("click", function () {
      const idToRemove = dataPoints[variable][i].locationID;
      world.removeLocationMarker(world.scene, idToRemove, shaderUniforms);

      dataPoints[variable].splice(i, 1);
      drawGraph(id, variable, world, shaderUniforms);
    });
    legend.style("cursor", "pointer");
  }
}

// create a tooltip which will display plotted data when hovering over graphs
function createTooltip(svg, x, variable) {
  const tooltip = d3.select("#tooltip");
  const tooltipLine = svg.append("line").attr("transform", `translate(${margin.left}, ${margin.top})`);
  svg.append("rect")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("width", width)
    .attr("height", height)
    .attr("opacity", 0)
    .on("mousemove", drawTooltip)
    .on("mouseout", removeTooltip);

  function removeTooltip() {
    tooltip.style("display", "none");
    tooltipLine.attr("stroke", "none");
  }

  function drawTooltip(event) {
    const xOffset = width / MONTHS.length / 2;
    const month = d3.timeParse("%b")(d3.timeFormat("%b")(x.invert(d3.pointer(event)[0] + xOffset)));

    tooltipLine.attr("stroke", "black")
      .attr("x1", x(month))
      .attr("x2", x(month))
      .attr("y1", 0)
      .attr("y2", height);

    const index = MONTHS.map(Number).indexOf(+month);
    const tooltipWidth = document.getElementById("tooltip").offsetWidth;

    tooltip.html(d3.timeFormat("%B")(month))
      .style("display", "block")
      .style("left", event.pageX - tooltipWidth / 2 + "px")
      .style("top", event.pageY + 20 + "px")
      .selectAll()
      .data(dataPoints[variable])
      .enter()
      .append("div")
      .style("color", (d) => d.color)
      .html((d) => d.data[index].toFixed(1) + " " + units[variable]);
  }
}

// convert svg into a png image and update button
function svgToPng(svgURL, button, filename) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("width", svgWidth * 4);
  canvas.setAttribute("height", svgHeight * 4);
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = svgURL;
  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = canvas.toDataURL("image/png");
    button.attr("href", png).attr("download", filename);
    URL.revokeObjectURL(png);
  };
}

// add functionality to graph buttons
function updateButtons(id, variable, world, shaderUniforms, source) {
  // when graph is deleted also delete data points for the corresponding variable
  document.getElementById("delete-graph" + variable).addEventListener("click", function () {
    resetData(variable, world, shaderUniforms);
  });

  //var filename = source + `_${variableNames[variable]}_climatearchive`;
  var filename = "Valdes et al (2021)" + `_${variableNames[variable]}_climatearchive`;

  //clean filename
  filename = filename.replace(/\(/g,"")
  filename = filename.replace(/\)/g,"")
  filename = filename.replace(/ /g,"_")

  //add date string
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  filename = filename + "_" + yyyy + '_' + mm + '_' + dd;

  const svg = document.getElementById(id).querySelector("svg");
  const svgString = new XMLSerializer().serializeToString(svg);
  const svgData = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const svgURL = URL.createObjectURL(svgData);

  // update button to download svg image of graph
  d3.select("#svg-download" + variable)
    .attr("href", svgURL)
    .attr("download", filename + ".svg");

  // update button to download png image of graph
  const downloadPngButton = d3.select("#png-download" + variable);
  svgToPng(svgURL, downloadPngButton, filename + ".png");

  // update button to download csv data of graph
  d3.select("#csv-download" + variable)

    .attr("href", "data:text/csv;base64," + btoa(unescape(encodeURIComponent(graphDataToCsv(variable)))))
    // .attr("href", "data:text/csv;base64," + btoa(graphDataToCsv(variable)))
    .attr("download", filename + ".csv");

  // toggle between relative and absolute scale and redraw graph when button pressed
  document.getElementById("toggle-scale" + variable).onclick = function () {
    relativeScale[variable] = !relativeScale[variable];
    drawGraph(id, variable, world, shaderUniforms);
  };
}

export function drawGraph(id, variable, world, shaderUniforms, intervalNameLong, source) {
  const svg = createSvg(id, variable);

  if (dataPoints[variable].length == 0) {
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", svgWidth / 2)
      .attr("y", svgHeight / 2)
      .text("No data");

    return;
  }

  const [x, y, xAxis, yAxis, xAxisGrid, yAxisGrid] = createAxes(variable);
  appendAxes(svg, variable, xAxis, yAxis, xAxisGrid, yAxisGrid, source);
  appendPaths(svg, variable, x, y);
  appendLegend(svg, id, variable, world, shaderUniforms, intervalNameLong);
  createTooltip(svg, x, variable);
  updateButtons(id, variable, world, shaderUniforms, source);
}

// fetch data and display graph
export function displayGraph(id, lat, lon, modelID, intervalNameShort, intervalNameLong, color, locationID, world, shaderUniforms, markerTime, source, modernLat, modernLon) {
  // read the data
  const [monthlyMean, annualMean, variable] = getData();

  if (monthlyMean !== null) {
    // format figure annotations
    const labelTime = -markerTime;
    const latLabel = lat >= 0 ? lat + "°N" : -lat + "°S";
    const lonLabel = lon >= 0 ? lon + "°E" : -lon + "°W";

    dataPoints[variable].push({
      data: monthlyMean,
      annualMean: annualMean,
      legendLabel1: intervalNameLong,
      legendLabel2: `annual: ${annualMean.toFixed(1)} ${units[variable]} (${labelTime} Ma / ${latLabel} / ${lonLabel})`,
      intervalNameShort: intervalNameShort,
      color: color,
      locationID: locationID,
      markerTime: markerTime,
      lat: lat,
      lon: lon,
      source: source,
      modernLat: modernLat,
      modernLon: modernLon,
    });
  }

  drawGraph(id, variable, world, shaderUniforms, intervalNameLong, source);
  world.hideDummyMarker();
}
