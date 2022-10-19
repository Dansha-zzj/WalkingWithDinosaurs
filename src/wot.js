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
import '../styles/wot.css'

import { World } from './World/World.js';
import { initSidebar } from './sidebar.js';

import { wot } from './modelConfigs/wotConfigs.js'
import { shaderUniformsWoT } from './World/systems/shaderUniforms.js';

async function main() {

  // Sidebar
  initSidebar()

  // Three.js part of the application
  // Get a reference to the container element
  const container = document.querySelector('#world');

  // create a new world
  const world = new World(container, wot, "plane", shaderUniformsWoT);
  //const world = new World(container, duneHighRes, "plane", shaderUniformsDune);

  const slider1 = document.getElementById('timeSlider');

  // complete async tasks
  await world.init(slider1, shaderUniformsWoT);

  // start the animation loop and intro animation
  var playIntroAnimation = true
  var playIntroHelp = true

  // start the animation loop and intro animation
  world.start(playIntroAnimation, playIntroHelp, shaderUniformsWoT);

}

main().catch((err) => {
  console.error(err);
});

