/////////////////////////////////////////////////////////////////////////////
//
//  Structure of app is based on modular approach described in:
//  https://discoverthreejs.com/book/first-steps/world-app/
//  and
//  https://pierfrancesco-soffritti.medium.com/how-to-organize-the-structure-of-a-three-js-project-77649f58fa3f
//
//  main.js is the entry point to the Javascript side of the app.
//  It has access to the DOM and creates an instance of the World class.
//  It should not know anything about three.js at all, just that we have
//  a component capable to produce a 3D scene. It also initializes the
//  database interface after a double-click anywhere on the globe.
//
/////////////////////////////////////////////////////////////////////////////

// CSS styling
import "../styles/main.css";

import { World } from "./World/World.js";
import { initSidebar } from "./sidebar.js";

import { Scotese02 } from "./modelConfigs/phanerozoicConfigs.js";
import { shaderUniformsPhanerozoic } from "./World/systems/shaderUniforms.js";
import { findeClosestModelAge } from "./World/systems/modelLookup.js";

import { geoTimescale } from "./geo-timescale-d3-v7/src/index.js";
import { setupGraphing, requestData } from "./setup-graphing";

// check for WebGL2
const gl = document.createElement("canvas").getContext("webgl2");
if (!gl) {
  alert("Welcome to the climatearchive! \n\n Unfortunately, it seems that your browser does not support \n WebGL2, which is necessary to use the application. \n\n Please try again using Chrome or Firefox. \n\n Safari will be supported starting with the new \n macOS Monterey and iOS 15 in late 2021. \n\n Infos on how to enable WebGL2 on Safari running \n on older operating systems at https://caniuse.com/webgl2");
  throw new Error("WebGL2 required");
} else {
  console.log("webgl2 works!");
}

async function main() {
  // Sidebar
  initSidebar();

  // Three.js part of the application
  // Get a reference to the container element
  const container = document.querySelector("#world");

  // create a new world
  const world = new World(container, Scotese02, "plane", shaderUniformsPhanerozoic);

  const slider1 = document.getElementById("timeSlider");

  // complete async tasks
  await world.init(slider1, shaderUniformsPhanerozoic);

  // start the animation loop and intro animation
  const playIntroAnimation = true;
  const playIntroHelp = true;

  // start the animation loop and intro animation
  world.start(playIntroAnimation, playIntroHelp, shaderUniformsPhanerozoic);

  // Database part of the application
  setupGraphing(world, shaderUniformsPhanerozoic);

  // Double-click anywhere on the globe starts database interface
  let firstClickDetected = false;

  // hide plot selection window and marker after click on close button
  document.getElementById("pointer-close").addEventListener("click", () => {
    document.getElementById("pointer").style.display = "none";
    world.hideDummyMarker();
  });

  //event listerner to listen for clicks and remove the pointer if it detects clicks not not on the pointer element
  document.getElementById("world").addEventListener("click", async (event) => {

    // no previous click registered
    if (firstClickDetected == false) {
      if (event.target.classList.contains("pointer-options")) return;

      document.getElementById("pointer").style.display = "none";
      world.hideDummyMarker();
      console.log("deleting");

      firstClickDetected = true;

      // reset variable to false, i.e. double-click needs to happen within 600 ms
      setTimeout(function () {
        firstClickDetected = false;
      }, 600);

      // double-click within 600 ms detected
      // get click position, add sphere to surface and query THREDDS data server
    } else {

      // make sure time looping is paused by clikcing the 'pause' button
      document.getElementById("playPause-button").click()

      // find geographical coordinates for double-click location and time of closest available model data
      var [userLongitude, userLatitude, modelID, intervalNameShort, intervalNameLong, source, markerTime, markerRotationFlag] = await world.surfaceDblClick(event, shaderUniformsPhanerozoic);

      let validAge
      // find valid age (i.e. maximum age) flor present-day location
      if (markerRotationFlag) {

        validAge = await world.findValidAgeTexture(userLatitude, userLongitude);

      } else {

        validAge = markerTime

      }

      if (userLatitude && userLongitude) {

        // update plot dialogue location to stay within world map and display it
        const { x, y, width, height, top, left } = document.getElementById("world").getBoundingClientRect();
        if (event.clientX <= (x + width + left) / 2) {
          document.getElementById("pointer").style.left = event.clientX + 25 + "px";
        } else {
          document.getElementById("pointer").style.left = event.clientX - 200 + "px";
        }
        if (event.clientY <= (y + height + top) / 2) {
          document.getElementById("pointer").style.top = event.clientY + "px";
        } else {
          document.getElementById("pointer").style.top = event.clientY - 250 + "px";
        }
        document.getElementById("pointer").style.display = "block";

        // generate unique ID for location
        // const currentLongCoarse = userLongitude.toFixed(0);
        // const currentLatCoarse = userLatitude.toFixed(0);
        const currentLongCoarse = Math.round(userLongitude);
        const currentLatCoarse = Math.round(userLatitude);

        const locationID = String(modelID) + "/" + String(currentLatCoarse) + "/" + String(currentLongCoarse);

        const modernLat = -999
        const modernLon = -999

        requestData(
          currentLatCoarse,
          currentLongCoarse,
          userLatitude,
          userLongitude,
          modelID,
          intervalNameShort,
          intervalNameLong,
          source,
          locationID,
          shaderUniformsPhanerozoic,
          markerTime,
          validAge,
          markerRotationFlag,
          true,
          modernLat,
          modernLon,
        );

      }

      // reset click state
      firstClickDetected = false;
    }
  });
}

// D3.js geo-timescale-d3-v7 from https://github.com/JulesBlm/geo-timescale/tree/d3-v7
const containerTimescale = document.querySelector("#geologicTimescale");

//geoTimescale(containerTimescale, { width: containerTimescale.clientWidth, height: 175, fontSize: 16,  neighborWidth: 15});
geoTimescale(containerTimescale, {
  width: containerTimescale.clientWidth,
  height: containerTimescale.clientHeight,
  fontSize: 16,
  neighborWidth: 15
});

// make timescale responsive by deleting old one and call function again
// (there must be a cleaner and faster way to just redraw the boxes)
// using ResizeObserver to also detect toggling of sidebar

new ResizeObserver(() => {
  geoTimescale.clearTimescale();

  geoTimescale(containerTimescale, { width: containerTimescale.clientWidth, height: containerTimescale.clientHeight, fontSize: 16, neighborWidth: 15 });
}).observe(containerTimescale);

main().catch((err) => {
  console.error(err);
});
