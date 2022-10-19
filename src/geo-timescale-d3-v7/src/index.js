import { zoom } from "d3-zoom";
import { transition } from "d3-transition";
import { select } from "d3-selection";
import { partition, stratify } from "d3-hierarchy";
import intervals from "./intervals.json";

import { timeControl } from '../../World/systems/initialModelConfig.js'

const defaults = {
  width: 960,
  height: 400,
  tickLength: 0,
  neighborWidth: 25,
  fontSize: 12,
};

var rectColorDefault = "#FFF"
var rectColorHover = "#8691a0"

const margins = { bottom: 30 };

const labelVisible = (d) => +(d.x1 - d.x0 > 14);

const hierarchicalData = stratify()(intervals).sum((d) =>
  d.leaf ? d.start - d.end : 0
);

export function geoTimescale(parentSelector, config = {}) {
  const {
    tickLength = defaults.tickLength,
    width = defaults.width,
    height = defaults.height,
    neighborWidth = defaults.neighborWidth,
    fontSize = defaults.fontSize,
  } = config;
  const font = `${fontSize}px sans-serif`;

  // Create a new d3 partition layout
  const makePartition = (data) =>
    partition()
      .size([width, height - margins.bottom])
      .padding(0)(data);

  const root = makePartition(hierarchicalData);

  const svg = select(parentSelector)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("font", font);

  const g = svg.append("g");

  // let focus = root;
  // Make this into a view, so that the currently hovered sequence is available to the breadcrumb
  const element = svg.node();
  let focus = root;
  element.value = { sequence: [] };

  // Expose focus and ancestors
  geoTimescale.focus = focus;
  geoTimescale.sequence = [];


  let hideSmallTicks = true;
  let breadcrumb

  const cellGroup = g.append("g").attr("id", "cells");

  const cell = cellGroup
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  const rect = cell
    .append("rect")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", rectColorDefault)
    .attr("stroke-width", 1.5)
    .attr("cursor", "pointer")
    .on("pointerenter", (_event, d) => {

      if (timeControl.hoverMode) {

        // Get the ancestors of the current segment
        const sequence = d.ancestors().reverse();
        // Highlight the ancestors
        cell.attr("fill-opacity", (d) => (sequence.includes(d) ? 1.0 : 0.5));
        rect.attr("stroke",rectColorHover );

        // change in 'timeControl.selectedTime' will be detected in slider.js and applied
        // set to present day if Phanerozoic is selected
        if (sequence.length === 1) {

          timeControl.selectedTime = 0.0

        } else {

          timeControl.selectedTime = ( d.data.start*-1.0  + d.data.end*-1.0 ) / 2.0

        }

        geoTimescale.sequence = sequence;

        // Update the value of this view with the currently hovered sequence and percentage
        element.value = { sequence };
        element.dispatchEvent(new CustomEvent("input"));

        initBreadcrumb()

      }

    })
    .on("click", clicked);

  svg.on("pointerleave", () => {

    if (timeControl.hoverMode) {

      cell.attr("fill-opacity", 1);
      rect.attr("stroke",rectColorDefault );
      geoTimescale.sequence = [];

      // Update the value of this view
      element.value = { sequence: "" };
      element.dispatchEvent(new CustomEvent("input"));

      clearBreadcrumb()

    }

  });

  cell.append("title").text((d) => {
    const sequence = d
      .ancestors()
      .map((d) => d.data.name)
      .reverse();

    return `${sequence.join(" > ")}`;
  });

  const text = cell
    .append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("x", (d) => {
      const textX = (d.x1 - d.x0) / 2;
      return Number.isNaN(textX) ? 0 : textX;
    })
    .attr("y", (d) => (d.y1 - d.y0) / 2)
    .attr("fill", (d) => d.data.textColor ?? "black")
    .attr("fill-opacity", labelVisible)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .text((d) => {
      const rectWidth = d.x1 - d.x0;
      const labelWidth = getTextWidth(d.data.name, font);
      const abbrev = d.data.abbr || d.data.name.charAt(0);

      return rectWidth - 10 < labelWidth ? abbrev : d.data.name;
    });

  // Append ages ticks scale bar
  const ticksGroup = g
    .append("g")
    .attr("id", "ticks")
    .attr("transform", `translate(0,${height - margins.bottom})`); // Move tick group down

  ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks));

  function clicked(event, p) {
    focus = p === focus ? p.parent : p;
    geoTimescale.focus = focus;
    hideSmallTicks = [0, 1].includes(focus.depth);

    const sequence = p.ancestors().reverse();

    // change in 'timeControl.selectedTime' will be detected in slider.js and applied
    // set to present day if Phanerozoic is selected
    if (sequence.length === 1) {

      timeControl.selectedTime = 0.0

    } else {

      timeControl.selectedTime = ( p.data.start*-1.0  + p.data.end*-1.0 ) / 2.0

    }

    cell.attr("fill-opacity", 1);
    rect.attr("stroke",rectColorDefault );
    
    clearBreadcrumb()

    const focusAncestors = focus.ancestors().slice(1); // Ignore clicked node itself

    const t = event ? transition().duration(450) : null; // Can't transition when using input, bit of a hack

    // Show a bit of the neighbouring cells on focus of an interval
    const leftNeighbor =
      focus.data.start === root.data.start ? 0 : neighborWidth;
    const rightNeighbor = focus.data.end === root.data.end ? 0 : neighborWidth;

    root.each((d) => {
      const widthMinusNeighbors = width - rightNeighbor - leftNeighbor;
      const focusWidth = focus.x1 - focus.x0; // partition width of focused node

      const target = {
        x0:
          leftNeighbor + ((d.x0 - focus.x0) / focusWidth) * widthMinusNeighbors,
        x1:
          leftNeighbor + ((d.x1 - focus.x0) / focusWidth) * widthMinusNeighbors,
        y0: d.y0,
        y1: d.y1,
      };

      d.target = target;
    });

    // Reset drag
    g.transition(t).attr("transform", "translate(0,0)");

    cell
      .transition(t)
      .attr("transform", (d) => `translate(${d.target.x0},${d.target.y0})`);

    rect
      .transition(t)
      .attr("width", (d) => +(d.target.x1 - d.target.x0))
      .attr("stroke", rectColorHover)
      .attr("stroke-width", 1.5);

    if (event) {
      select(this)
        .transition(t)
        .attr("stroke", "white")
        .attr("stroke-width", 2.);

      select(this.parentNode).raise();
    }

    text
      .transition(t)
      .attr("fill-opacity", (d) =>
        focusAncestors.includes(d) ? 1 : labelVisible(d.target)
      )
      .attr("x", (d) => {
        // Position all the ancestors labels in the middle
        if (focusAncestors.includes(d)) {
          return -d.target.x0 + width / 2;
        }
        const rectWidth = d.target.x1 - d.target.x0;
        const textX = rectWidth / 2;

        return Number.isNaN(textX) ? -10 : textX;
      })
      .text((d) => {
        const rectWidth = d.target.x1 - d.target.x0;
        const labelWidth = getTextWidth(d.data.name, font);
        const abbrev = d.data.abbr || d.data.name.charAt(0);

        return rectWidth - 8 < labelWidth ? abbrev : d.data.name;
      });

    ticksGroup.call((g) => ticks(g, makeTicksData(root), hideSmallTicks, t));
  }

  svg.call(
    zoom()
      .extent([
        [0, 0],
        [width, height],
      ])
      .scaleExtent([1, 8])
      .on("zoom", zoomed)
      .on("end", () => {
        rect.attr("cursor", "pointer");
      })
  );

  function zoomed(e) {
    if (!root.target) return;

    const translateX = e.transform.x;

    if (
      translateX + root.target.x0 > 0 ||
      root.x1 - translateX > root.target.x1
    )
      return;

    rect.attr("cursor", "grabbing");
    g.attr("transform", `translate(${translateX},0)`);
  }

  function ticks(g, data, hideSmallTicks, t) {
    g.selectAll("g")
      .data(data)
      .join(
        (enter) => {
          const tick = enter
            .append("g")
            .attr("transform", (d) => `translate(${d.x}, 0)`)
            .attr("text-anchor", (d) =>
              d.x === 0 ? "start" : d.x === width ? "end" : "middle"
            )
            .attr("opacity", (d) =>
              [3, 4, 5].includes(d.depth) && hideSmallTicks ? 0 : 1
            );

          tick
            .append("line")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("x1", 0)
            .attr("y1", 2)
            .attr("x2", 0)
            .attr(
              "y2",
              (d) => margins.bottom - d.depth * tickLength - fontSize
            );

          tick
            .append("text")
            .attr("x", 0)
            .attr(
              "y",
              (d) => margins.bottom - d.depth * tickLength - fontSize / 2
            )
            .attr("dominant-baseline", "middle")
            .attr("font-size", (d) => `${1 - 0.05 * d.depth}em`)
            .attr("stroke-width", .6)
            .attr("stroke", rectColorDefault)
            .attr("fill", rectColorDefault)
            .text((d) => d.text)

        },
        (update) =>
          update
            .transition(t)
            .attr("opacity", (d) =>
              [3, 4, 5].includes(d.depth) && hideSmallTicks ? 0 : 1
            )
            .attr("transform", (d) => `translate(${d.targetX}, 0)`)
            .attr("dominant-baseline", "hanging")
            .attr("text-anchor", (d) =>
              d.targetX === 0 ? "start" : d.targetX === width ? "end" : "middle"
            )
      );
  }

  geoTimescale.clearTimescale = () => { 
  
    const svg = select(parentSelector)
  
    svg.selectAll('*').remove();
  
    return svg.node();
  }


}

function makeTicksData(root, width = 960) {
  const uniqueStartAges = new Set(
    root.descendants().map((node) => node.data.start)
  );

  const ticksData = Array.from(uniqueStartAges)
    .map((start) =>
      root.descendants().find((node) => node.data.start === start)
    )
    .map((d) => ({
      x: d.x0,
      depth: d.depth,
      targetX: d?.target?.x0 || 0,
      text: d.data.start,
    }));

  const now = {
    x: root.x1,
    depth: 0,
    targetX: root?.target?.x1 || width,
    text: 0,
  };

  ticksData.push(now);

  return ticksData;
}

// Via https://stackoverflow.com/questions/1636842/svg-get-text-element-width
function getTextWidth(text, font) {
  // re-use canvas object for better performance
  var canvas =
    getTextWidth.canvas ||
    (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);

  return metrics.width;
}

// var breadcrumbWidth = 120
// var breadcrumbHeight = 30

 //var breadcrumbWidth = 120
 //var breadcrumbHeight = 40

// From https://observablehq.com/@kerryrodden/sequences-icicle by Kerry Rodden
// Generate a string that describes the points of a breadcrumb SVG polygon.
function breadcrumbPoints(d, i) {

  const container = document.querySelector("#breadcrumbs");
  const ageContainer = document.querySelector("#ageLabel");

  var breadcrumbWidth = container.clientWidth / 6
  var breadcrumbHeight = ageContainer.clientHeight * 0.85

  const tipWidth = 10;
  const points = [];
  points.push("0,0");
  points.push(`${breadcrumbWidth},0`);
  points.push(`${breadcrumbWidth + tipWidth},${breadcrumbHeight / 2}`);
  points.push(`${breadcrumbWidth},${breadcrumbHeight}`);
  points.push(`0,${breadcrumbHeight}`);
  if (i > 0) {
    // Leftmost breadcrumb; don't include 6th vertex.
    points.push(`${tipWidth},${breadcrumbHeight / 2}`);
  }
  return points.join(" ");
}

function initBreadcrumb() {

  const container = document.querySelector("#breadcrumbs");
  const ageContainer = document.querySelector("#ageLabel");

  var breadcrumbWidth = container.clientWidth / 6
  var breadcrumbHeight = ageContainer.clientHeight * 0.85

  let svg = select(container)

  svg.selectAll('*').remove();
  
  var stageFontSize
  if (container.clientWidth >= 750) {
    stageFontSize = "16px sans-serif"
  } else {
    stageFontSize = "10px sans-serif"
  }
  
  svg = select(container)
    .append("svg")
//    .attr("viewBox", `0 0 ${breadcrumbWidth * 5} ${breadcrumbHeight}`)
    .attr("viewBox", `0 0 ${breadcrumbWidth * 6} ${breadcrumbHeight}`)
    .style("font", stageFontSize)
    .style("margin", "0px")
    .style("margin-top", "5px");

  const g = svg
    .selectAll("g")
    .data(geoTimescale.sequence)
    .join("g")
    .attr("transform", (d, i) => `translate(${i * breadcrumbWidth}, 0)`);

  g.append("polygon")
    .attr("points", breadcrumbPoints)
    .attr("fill", (d) => d.data.color)
    .attr("stroke", "white");

  g.append("text")
    .attr("x", (breadcrumbWidth + 10) / 2)
    .attr("y", breadcrumbHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", (d) => d.data.textColor ?? "black")
    .text((d) => d.data.name);

  // svg
  //   .append("text")
  //   .text(timescale.percentage > 0 ? icicle.percentage + "%" : "")
  //   .attr("x", (timescale.sequence.length + 0.5) * breadcrumbWidth)
  //   .attr("y", breadcrumbHeight / 2)
  //   .attr("dy", "0.35em")
  //   .attr("text-anchor", "middle");

  return svg.node();
}

function clearBreadcrumb() {

  const container = document.querySelector("#breadcrumbs");

  const svg = select(container)

  svg.selectAll('*').remove();

  return svg.node();
}
// export default geoTimescale

