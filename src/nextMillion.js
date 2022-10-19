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
import '../styles/nextMillion.css'

import { World } from './World/World.js';
import { initSidebar } from './sidebar.js';

import { nextMillion } from './modelConfigs/nextMillionConfigs.js'
import { shaderUniformsNextMillion } from './World/systems/shaderUniforms.js';

import { plotStripesNextMillion  } from "./warmingStripes/plotStripesNextMillion.js";

import { loadCMIP6CSV } from './World/systems/modelLookup.js'

async function main() {

  // Sidebar
  initSidebar()

  // Three.js part of the application
  // Get a reference to the container element
  const container = document.querySelector('#world');

  // create a new world
  const world = new World(container, nextMillion, "sphere", shaderUniformsNextMillion);
  //const world = new World(container, duneHighRes, "plane", shaderUniformsDune);

  // D3.js warming stripes based on code from
  // https://github.com/adilzeshan/warming-stripes

  const csv = await loadCMIP6CSV( '/modelData/BRIDGE/emulator/emulator_tas.globalMeanAnomaly.capped.csv' )
  // remove last empty row from array
  let popped = csv.pop();


  const containerStripes = document.querySelector("#stripes");

  let warmingStripes = await plotStripesNextMillion(csv, containerStripes);

  // complete async tasks
  const slider1 = document.getElementById('timeSlider');
  await world.init(slider1, shaderUniformsNextMillion);

  // start the animation loop and intro animation
  var playIntroAnimation = true
  var playIntroHelp = true

  var buttonTemp = document.querySelector("#tempOnOff")
  var buttonIce = document.querySelector("#iceOnOff")
  //buttonPrecip.classList.add('active')
  buttonTemp.classList.add('active')
  buttonIce.classList.add('active')

  // start the animation loop and intro animation
  world.start(playIntroAnimation, playIntroHelp, shaderUniformsNextMillion);
  world.loop.updateEachKeyFrame.push(warmingStripes)

}

main().catch((err) => {
  console.error(err);
});

