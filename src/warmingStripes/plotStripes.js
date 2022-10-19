import * as d3 from "d3";
import { coloursHawkins, coloursHawkinsExtended, coloursCOP26Map } from "./colours.js";
import { timeControl } from '../World/systems/initialModelConfig.js'
import { data } from "jquery";

//const annualAverages = data.map(year => year.value);
const stripeHeight = 115;

var stripesMin = -0.9
var stripesMax =  2.7

async function plotStripes(data, id) {

  const fullData = data
  const dataLength = data.length
  const stripeWidth = 96 / dataLength;

  var svgWidth = id.clientWidth
  var stride = svgWidth / dataLength

  timeControl.hoverMode = false

  const mapToColour = d3
    .scaleLinear()
    .domain([stripesMin, stripesMax])
    .range([0, coloursHawkinsExtended.length - 1]);

  var svg = d3.select(id)
    .append("svg")
    .attr("height", "192")
    .attr("width", "100%")
    .attr("id", "asvg")

  var stripes = svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("height", stripeHeight)
    .attr("width", stripeWidth + "%")
    .attr("y", 20)
    .attr("x", (data, index) => index * stripeWidth + "%")
    .style("fill", data => coloursHawkinsExtended[Math.round(mapToColour(data.value))])
    .attr("stroke", data => coloursHawkinsExtended[Math.round(mapToColour(data.value))])
    .attr("year", data => data.year)
    .attr("stroke-width", stride / 10)
    .attr("highlight", 0)

    .on("touchstart", event => event.preventDefault())
    .on('click', function (_event, data, i) {

      if (timeControl.enableSlider) {

        timeControl.selectedTime = data.year

      }

    })

    .on("mousedown", function(_event) { 
      
      // start drag mode only after clicking for 100 ms
      clearTimeout(this.downTimer);
      this.downTimer = setTimeout(function() {
        timeControl.hoverMode = true
    }, 100);
    
    })
    .on("mouseup", function() { timeControl.hoverMode = false; clearTimeout(this.downTimer); })
    .on("touchstart", function() { timeControl.hoverMode = true; })
    .on("touchend", function() { timeControl.hoverMode = false; })

    .on("pointermove", function (_event, data, i) {

      if (timeControl.hoverMode && timeControl.enableSlider) {

        timeControl.hoverMode = true

        // look up stripe at the cursor position
        var element = document.elementFromPoint(_event.x, _event.y);

        // get year attribute of this stripe
        var selectedYear = element.getAttribute("year")
  
        // change time if a valid year is found
        if (selectedYear) {
  
          timeControl.selectedTime = selectedYear
  
        }

      }

    })

    var labelColor = "white"

    // hidden labels used later for local watming annotations
    svg.append("text")
    .attr("id", "year15-"+id.id)
    .attr("text-anchor", "middle")
    .attr("x", 30 / dataLength * 100 + "%")
    .attr("y", 88)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelSmall")
    .text("+1.5°C by ")
    .style("opacity",0.0);

    svg.append("text")
    .attr("id", "label15-"+id.id)
    .attr("text-anchor", "middle")
    .attr("x", 30 / dataLength * 100 + "%")
    .attr("y", 88)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelMilestones")
    .text("+1.5°C by ")
    .style("opacity",0.0);

    svg.append("text")
    .attr("id", "year30-"+id.id)
    .attr("text-anchor", "middle")
    .attr("x", 30 / dataLength * 100 + "%")
    .attr("y", 88)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelSmall")
    .text("+3.0°C by ")
    .style("opacity",0);

    svg.append("text")
    .attr("id", "label30-"+id.id)
    .attr("text-anchor", "middle")
    .attr("x", 30 / dataLength * 100 + "%")
    .attr("y", 88)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelMilestones")
    .text("+3.0°C by ")
    .style("opacity",0);

    svg.append("text")
    .attr("id", "finallabel-"+id.id)
    .attr("text-anchor", "middle")
    .attr("x", 30 / dataLength * 100 + "%")
    .attr("y", 88)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelMilestones")
    .text("°C")
    .style("opacity",0);

    svg.append("text")
    .attr("id", "finalyear-"+id.id)
    .attr("text-anchor", "middle")
    .attr("x", 142 / dataLength * 100 + "%")
    .attr("y", 145)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelSmall")
    .text("2100")
    .style("opacity",0);

//    var copPositionX = id.clientWidth * 0.4647

//     svg.append("text")
//   //  .attr("text-anchor", "middle")
//  //   .attr("x", 50 / dataLength * 100 + "%")
//  //   .attr("y", 87)
//     .attr("fill", labelColor)
//     .attr("class", "stripeLabel")
//     .text("COP26")
//     .attr('transform', "translate("+copPositionX+",117)rotate(-90)")

    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", 69 / dataLength * 100 + "%")
    .attr("y", 147)
    .attr("fill", labelColor)
    .attr("class", "stripeLabelSmall")
    .text("COP26")
    .attr("id", "cop26-"+id.id)

    svg.append("text")
    .attr("text-anchor", "middle")
    .attr("x", 132 / dataLength * 100 + "%")
    .attr("y", 102)
    .attr("fill", labelColor)
    .attr("class", "stripeLabel")
    .text("by 2100");

    if (id.id === "stripes1"){

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 98 / dataLength * 100 + "%")
      .attr("y", 72)
      .attr("fill", labelColor)
      .attr("class", "stripeLabel")
      .text("net-zero");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 98 / dataLength * 100 + "%")
      .attr("y", 102)
      .attr("fill", labelColor)
      .attr("class", "stripeLabel")
      .text("by 2050s");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 132 / dataLength * 100 + "%")
      .attr("y", 72)
      .attr("fill", labelColor)
      .attr("class", "stripeLabel")
      .text("+1.5°C");

      svg.append("text")
      .attr("text-anchor", "left")
      .attr("x", 0)
      .attr("y", 15)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("observations + ssp119 10-model 10-year mean");

    } else {


      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 98 / dataLength * 100 + "%")
      .attr("y", 72)
      .attr("fill", labelColor)
      .attr("class", "stripeLabel")
      .text("current");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 98 / dataLength * 100 + "%")
      .attr("y", 102)
      .attr("fill", labelColor)
      .attr("class", "stripeLabel")
      .text("policies");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 132 / dataLength * 100 + "%")
      .attr("y", 72)
      .attr("fill", labelColor)
      .attr("class", "stripeLabel")
      .text("+3.0°C");

      svg.append("text")
      .attr("text-anchor", "right")
      .attr("x", 0)
      .attr("y", 15)
      .attr("fill", labelColor)
      .attr("label", "label2")
      .attr("class", "stripeLabelSmall")
      .text("observations + ssp245 34-model 10-year mean");
    } 

    stripes.tick = (index) => { 

    var svg = d3.select(id)

    svg.selectAll("rect")

      .attr('width', stripeWidth + "%")
      .attr("height", stripeHeight )
      .attr("y", 20 )
      //.style("fill", data => coloursHawkinsExtended[Math.round(mapToColourStripes(data.value))])
      .attr("stroke", data => coloursHawkinsExtended[Math.round(mapToColour(data.value))])
      .attr("stroke-width", stride / 10)
      .attr("highlight", 0)
      .attr("transform", "translate(0, 0)")


      d3.select(stripes.nodes()[ 71 ])
      .style("fill", "black")
      .attr("stroke", "black")
      .raise();

      d3.selectAll("text")
      .filter(function() {
        return d3.select(this).attr("class") == "stripeLabel"; // filter by single attribute
      })
      .raise();

      if (index == 71) {

        d3.select(stripes.nodes()[ index ])
        .attr('height', 1.2 * stripeHeight) 
        .attr('width', 6 * stripeWidth + "%") 
        .attr('y', 8.0) 
        .attr("stroke", "gray")
        .style("fill", coloursHawkinsExtended[Math.round(mapToColour(data[71].value))])
        .attr("stroke", "gray")
        .attr("stroke-width", stride / 2)
        .attr("highlight", 1)
        .raise();

      } else {

        d3.select(stripes.nodes()[ index ])
        .attr('height', 1.2 * stripeHeight) 
        .attr('width', 6 * stripeWidth + "%") 
        .attr('y', 8.0) 
        .attr("stroke", "gray")
    //    .attr("transform", "translate(-"+3*stripeWidth+", 0)")
        .attr("stroke", "gray")
        .attr("stroke-width", stride / 2)
        .attr("highlight", 1)
        .raise();

      }



        d3.selectAll("text")
        .filter(function() {
          return d3.select(this).attr("class") == "stripeLabel"; // filter by single attribute
        })
        .raise();

  }

  return stripes

}

async function plotLocalWarming(localData, stripesData, id, plotDuration, maxValue) {

  timeControl.enableSlider = false

  setTimeout(function() {

    timeControl.enableSlider = true

  }, plotDuration);

  var svg = d3.select(id);

  const stripeWidth = 96 / stripesData.length;
  var svgWidth = id.clientWidth
  var stride = svgWidth / stripesData.length
  
  const mapToColourStripes = d3
  .scaleLinear()
  .domain([stripesMin, stripesMax])
  .range([0, coloursHawkinsExtended.length - 1]);

  const mapToColourWarming = d3
  .scaleLinear()
  .domain([0, 13])
  .range([0, coloursCOP26Map.length - 1]);

  var stripes = svg.selectAll("rect")
    .sort((a,b) => d3.ascending(a.year, b.year))
    .data(localData)

  stripes
    .transition()
    .delay(0)
    .duration(1000)
    .attr('width', stripeWidth + "%")
    .attr("height", (data, index) => Math.abs(data.value) / maxValue * stripeHeight)
    .attr("y", (data, index) => 135 - Math.abs(data.value) / maxValue * stripeHeight)
    .style("fill", data => coloursCOP26Map[Math.round(mapToColourWarming(Math.abs(data.value)))])
    .attr("stroke-width", stride / 4)
    .attr("stroke", "black")
    .attr("transform", "translate(0, 0)")

    d3.select("#cop26-"+ id.id) 
      // fade out
      .transition()
      .delay(0)
      .duration(1000)
      .style("opacity", 0.0)

      // fade in
      .transition()
      .delay(plotDuration - 1000)
      .duration(1000)
      .style("opacity", 1.0)

    // add labels to local warming chart
    var label1Drawn = false
    var label2Drawn = false
    var label3Drawn = false

    for (let i = 0; i < localData.length; i++) { 

      // 1.5 degC label
      if ( localData[i].value >= 1.5 && label1Drawn == false) {

        var year = 1950 + i // center of 10 year running mean
        var decade = Math.floor(year/10)*10;

        // temp label
        d3.select("#label15-"+ id.id) 
        // change position first
        .attr("x", (i-5) / stripesData.length * 100 + "%")
        .attr("y", 135 - 2.0 / maxValue * stripeHeight)
        .text("+1.5°C")
        // fade in
        .transition()
        .delay(0)
        .duration(1000)
        .style("opacity", 1.0)
        // fade out
        .transition()
        .delay(plotDuration - 1000)
        .duration(1000)
        .style("opacity", 0.0)

        // year label
        d3.select("#year15-"+ id.id) 
        // change position first
        .attr("x", (i-5) / stripesData.length * 100 + "%")
        .attr("y", 145)
        .text(decade + "s")
        // fade in
        .transition()
        .delay(0)
        .duration(1000)
        .style("opacity", 1.0)
        // fade out
        .transition()
        .delay(plotDuration - 1000)
        .duration(1000)
        .style("opacity", 0.0)

        label1Drawn = true

      // 3.0 degC label
      } else if ( localData[i].value >= 3.0 && label2Drawn == false) {

        var year = 1950 + i // center of 10 year running mean
        var decade = Math.floor(year/10)*10;

        // temp label
        d3.select("#label30-"+ id.id) 
        // change position first
        .attr("x", (i-5) / stripesData.length * 100 + "%")
        .attr("y", 135 - 3.5 / maxValue * stripeHeight)
        .text("+3.0°C")
        // fade in
        .transition()
        .delay(0)
        .duration(1000)
        .style("opacity", 1.0)
        // fade out
        .transition()
        .delay(plotDuration - 1000)
        .duration(1000)
        .style("opacity", 0.0)

        // year label
        d3.select("#year30-"+ id.id) 
        // change position first
        .attr("x", (i-5) / stripesData.length * 100 + "%")
        .attr("y", 145)
        .text(decade + "s")
        // fade in
        .transition()
        .delay(0)
        .duration(1000)
        .style("opacity", 1.0)
        // fade out
        .transition()
        .delay(plotDuration - 1000)
        .duration(1000)
        .style("opacity", 0.0)

        label2Drawn = true

      }

    }

    // final year temp label
    d3.select("#finallabel-"+ id.id) 
    // change position first
    .attr("x", 143 / stripesData.length * 100 + "%")
    .attr("y", 135 - (localData[150].value + 0.05*localData[150].value) / maxValue * stripeHeight)
    .text("+"+(Math.round(localData[150].value * 10) / 10)+"°C")
    
    // fade in
    .transition()
    .delay(0)
    .duration(1000)
    .style("opacity", 1.0)
    // fade out
    .transition()
    .delay(plotDuration - 1000)
    .duration(1000)
    .style("opacity", 0.0)

    d3.select("#finalyear-"+ id.id)   
    // fade in
    .transition()
    .delay(0)
    .duration(1000)
    .style("opacity", 1.0)
    // fade out
    .transition()
    .delay(plotDuration - 1000)
    .duration(1000)
    .style("opacity", 0.0)
    
  setTimeout(function() {

  stripes
    .data(stripesData)
    .transition()
    .delay(plotDuration-2000)
    .duration(1000)
    .attr("height", stripeHeight )
    .attr("y", 135 - stripeHeight )
    .style("fill", data => coloursHawkinsExtended[Math.round(mapToColourStripes(data.value))])
    .attr("stroke", data => coloursHawkinsExtended[Math.round(mapToColourStripes(data.value))])
    .attr("stroke-width", stride / 10)

    d3.select(stripes.nodes()[ 71 ])
    .raise()
    .transition()
    .delay(plotDuration-2000)
    .duration(1000)
    .attr("height", stripeHeight )
    .attr("y", 135 - stripeHeight )
    .style("fill", "black")
    .attr("stroke", "black")

    // var stripes = svg.selectAll("rect")
    // .sort((a,b) => d3.ascending(a.year, b.year))
    // .data(localData)

    stripes
    .sort((a,b) => d3.ascending(a.year, b.year))
    .data(stripesData)

    // d3.select(stripes.nodes()[ 71 ])
    // .raise()

}, 2000);

setTimeout(function() {

   var highlightedStripe =  svg.selectAll("rect")
    .data(stripesData)
    .filter(function() {
      return d3.select(this).attr("highlight") == 1; // filter by single attribute
    })

    highlightedStripe
    .raise()
    .transition()
    //.delay(plotDuration)
    .duration(1000)
    .attr('height', 1.2 * stripeHeight) 
    .attr('width', 6 * stripeWidth + "%") 
    .attr('y', 8.0) 
    .attr("stroke", "gray")
    .attr("transform", "translate(-"+3*stripeWidth+", 0)")
    .attr("stroke", "gray")
    .attr("stroke-width", stride / 2)
    .attr("highlight", 1)
    .style("fill", data => coloursHawkinsExtended[Math.round(mapToColourStripes(data.value))])

  }, plotDuration);

    svg.selectAll("text")
      .filter(function() {
        return d3.select(this).attr("class") == "stripeLabel"; // filter by single attribute
      })
      .transition()
      .delay(0)
      .duration(1000)
      .style("opacity", 0)

      .transition()
      .delay(plotDuration - 1000)
      .duration(1000)
      .style("opacity", 1.)

    svg.selectAll("text")
      .filter(function() {
        return d3.select(this).attr("label") == "label1"; // filter by single attribute
      })
      .transition()
      .delay(0)
      .duration(1000)
      .text("historical + ssp119 10-model 10-year mean warming vs. 1850-1900")

      .transition()
      .delay(plotDuration)
      .duration(1000)
      .text("observations + ssp119 10-model 10-year mean");

      svg.selectAll("text")
      .filter(function() {
        return d3.select(this).attr("label") == "label2"; // filter by single attribute
      })
      .transition()
      .delay(0)
      .duration(1000)
      .text("historical + ssp245 34-model 10-year mean warming vs. 1850-1900")

      .transition()
      .delay(plotDuration)
      .duration(1000)
      .text("observations + ssp245 34-model 10-year mean");
    



}

export { plotStripes, plotLocalWarming };


// .data(data)
// .enter()
// .append("rect")
// .attr("height", stripeHeight)
// .attr("width", stripeWidth + "%")
// .attr("y", 20)
// .attr("x", (data, index) => index * stripeWidth + "%")
// .style("fill", data => coloursHawkinsExtended[Math.round(mapToColour(data.value))])
// .attr("stroke", data => coloursHawkinsExtended[Math.round(mapToColour(data.value))])
// .attr("year", data => data.year)
// .attr("stroke-width", stride / 4) 