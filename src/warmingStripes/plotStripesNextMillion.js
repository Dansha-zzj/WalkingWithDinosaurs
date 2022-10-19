import * as d3 from "d3";
import { coloursNextMillion } from "./colours.js";
import { timeControl } from '../World/systems/initialModelConfig.js'
import { data } from "jquery";

//const annualAverages = data.map(year => year.value);
const stripeHeight = 90;

var stripesMin = -8.
var stripesMax =  8.

async function plotStripesNextMillion(data, id) {

  const fullData = data
  const dataLength = data.length
  const stripeWidth = 96 / dataLength;

  var svgWidth = id.clientWidth
  var stride = svgWidth / dataLength

  timeControl.hoverMode = false

  const mapToColour = d3
    .scaleLinear()
    .domain([stripesMin, stripesMax])
    .range([0, coloursNextMillion.length - 1]);

  var svg = d3.select(id)
    .append("svg")
    .attr("width", "100%")
    .attr("id", "asvg")

  var stripes = svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("height", stripeHeight)
    .attr("width", stripeWidth + "%")
    .attr("y", 30)
    .attr("x", (data, index) => index * stripeWidth + "%")
    .style("fill", data => coloursNextMillion[Math.round(mapToColour(data.value))])
    .attr("stroke", data => coloursNextMillion[Math.round(mapToColour(data.value))])
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
 

//    var copPositionX = id.clientWidth * 0.4647

//     svg.append("text")
//   //  .attr("text-anchor", "middle")
//  //   .attr("x", 50 / dataLength * 100 + "%")
//  //   .attr("y", 87)
//     .attr("fill", labelColor)
//     .attr("class", "stripeLabel")
//     .text("COP26")
//     .attr('transform', "translate("+copPositionX+",117)rotate(-90)")

    // svg.append("text")
    // .attr("text-anchor", "middle")
    // .attr("x", 69 / dataLength * 100 + "%")
    // .attr("y", 147)
    // .attr("fill", labelColor)
    // .attr("class", "stripeLabelSmall")
    // .text("COP26")
    // .attr("id", "cop26-"+id.id)

    // svg.append("text")
    // .attr("text-anchor", "middle")
    // .attr("x", 132 / dataLength * 100 + "%")
    // .attr("y", 102)
    // .attr("fill", labelColor)
    // .attr("class", "stripeLabel")
    // .text("by 2100");

    //   svg.append("text")
    //   .attr("text-anchor", "middle")
    //   .attr("x", 98 / dataLength * 100 + "%")
    //   .attr("y", 72)
    //   .attr("fill", labelColor)
    //   .attr("class", "stripeLabel")
    //   .text("net-zero");

    //   svg.append("text")
    //   .attr("text-anchor", "middle")
    //   .attr("x", 98 / dataLength * 100 + "%")
    //   .attr("y", 102)
    //   .attr("fill", labelColor)
    //   .attr("class", "stripeLabel")
    //   .text("by 2050s");

    //   svg.append("text")
    //   .attr("text-anchor", "middle")
    //   .attr("x", 132 / dataLength * 100 + "%")
    //   .attr("y", 72)
    //   .attr("fill", labelColor)
    //   .attr("class", "stripeLabel")
    //   .text("+1.5°C");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 120 / dataLength * 100 + "%")
      .attr("y", 10)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("present");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 120 / dataLength * 100 + "%")
      .attr("y", 24)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("day");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 600 / dataLength * 100 + "%")
      .attr("y", 10)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("500,000 years");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 600 / dataLength * 100 + "%")
      .attr("y", 24)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("after present");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 1060 / dataLength * 100 + "%")
      .attr("y", 10)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("1,000,000 years");

      svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", 1060 / dataLength * 100 + "%")
      .attr("y", 24)
      .attr("fill", labelColor)
      .attr("class", "stripeLabelSmall")
      .attr("label", "label1")
      .text("after present");

    stripes.tick = (index) => { 

    var svg = d3.select(id)

    svg.selectAll("rect")

      .attr('width', stripeWidth + "%")
      .attr("height", stripeHeight )
      .attr("y", 30 )
      //.style("fill", data => coloursNextMillion[Math.round(mapToColourStripes(data.value))])
      .attr("stroke", data => coloursNextMillion[Math.round(mapToColour(data.value))])
      .attr("stroke-width", stride / 10)
      .attr("highlight", 0)
      .attr("transform", "translate(0, 0)")


      // d3.select(stripes.nodes()[ 71 ])
      // .style("fill", "black")
      // .attr("stroke", "black")
      // .raise();

      d3.selectAll("text")
      .filter(function() {
        return d3.select(this).attr("class") == "stripeLabel"; // filter by single attribute
      })
      .raise();

      if (index == 71) {

        d3.select(stripes.nodes()[ index ])
        .attr('height', 1.2 * stripeHeight) 
        .attr('width', 20 * stripeWidth + "%") 
        .attr('y', 20.0) 
        .attr("stroke", "gray")
        .style("fill", coloursNextMillion[Math.round(mapToColour(data[71].value))])
        .attr("stroke", "gray")
        .attr("stroke-width", stride * 3)
        .attr("highlight", 1)
        .attr("transform", "translate(-6, 0)")
        .raise();

      } else {

        d3.select(stripes.nodes()[ index ])
        .attr('height', 1.2 * stripeHeight) 
        .attr('width', 20 * stripeWidth + "%") 
        .attr('y', 20.0) 
        .attr("stroke", "gray")
    //    .attr("transform", "translate(-"+3*stripeWidth+", 0)")
        .attr("stroke", "gray")
        .attr("stroke-width", stride * 3)
        .attr("highlight", 1)
        .attr("transform", "translate(-6, 0)")
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

export { plotStripesNextMillion };


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