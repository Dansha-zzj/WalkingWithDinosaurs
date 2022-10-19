/* To add a new variable:
   add a unique key and value to the VARIABLES object e.g. wind: 2
   add the variable name to variableNames e.g. windspeed
   optionally add the y axis label used when graphing to yLabels e.g. Wind Speed (km/h)
   optionally add an absolute range to absoluteYRanges e.g. [0, 100]
   optionally add a unit conversion function to unitConverters e.g. (wind => wind * 3.6) for m/s to km/h
   note: VARIABLES is used to index the data so the order must match the csv columns returned by the server
*/

const d3 = require("d3");

export const VARIABLES = {
  temp: 0,
  rain: 1
};
export const variableNames = ["near-surface air temperature", "precipitation"];
export const yLabels = ["near-surface air temperature", "precipitation"];
export const units = ["°C", "mm/day"];
export const unitsPlain = ["degC", "mm/day"];
export const absoluteYRanges = [[-50, 50], [0, 15]];
const unitConverters = [(temp => temp - 273.15), (rain => rain * 84600)];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  .map((m) => d3.timeParse("%b")(m));

let csvData;

// request data from the server, store the returned csv in csvData and update the csv download button
export function csvRequest(lat, lon, modelID) {
  lon = parseFloat(lon);
  if (lon < 0) {
    lon += 360;
  }

  let params = "lat=" + lat + "&lon=" + lon + "&model=" + modelID;
  const url = "https://climatearchive.cloud:8443/getData?" + params;

  console.log(url);

  function httpRequest(address, reqType, asyncProc) {

    var xhr = new XMLHttpRequest();

    xhr.open(reqType, address, asyncProc);

    xhr.send();
    
    return xhr

  }

  var req = httpRequest(url, "GET", false )

  if (req.readyState !== 4) { return; }
  if (req.status === 200) {
    csvData = req.responseText;
  } else {
    console.error("HTTP error", req.status, req.statusText);
  }

}

// process the csv into a single array of values for the user-selected variable
export function getData() {
  let variable = parseInt(document.getElementById("variable-selector").value);
  if (!Object.values(VARIABLES).includes(variable)) {
    variable = VARIABLES.temp;
  }
  if (csvData == null) {
    alert("Error fetching data");
    return [null, variable];
  }
  let data = csvToObject(csvData);
  data = selectVariable(data, variable);

  let annualMean = data[0]
  
  // remove first row containing annual average
  data.shift(); 

  // check that the data has the right number of elements and there are no NaN values
  if (data.length != MONTHS.length || data.reduce((a, b) => a || isNaN(b), false)) {
    alert("Error processing data");
    return [null, variable];
  }

  return [data, annualMean, variable];
}

// create array of objects from string csv data
function csvToObject(csv) {
  const [headerLine, ...lines] = csv.split("\n");
  lines.splice(-1, 1); // remove empty string from end of array
  const headers = headerLine.split(",");

  const objects = lines.map((line) =>
    line.split(",").reduce((object, value, index) =>
      ({ ...object, [headers[index]]: value }), {})
  );

  return objects;
}

// select only only one variable to pass on for graphing/downloading
function selectVariable(data, variable) {
  const converter = unitConverters[variable] || (v => v);
  return data.map((d) => +Object.values(d)[variable + 1]).map(converter);
}
