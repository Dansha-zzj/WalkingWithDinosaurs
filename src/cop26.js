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
import '../styles/cop26.css'

import { World } from './World/World.js';
import { initSidebar } from './sidebar.js';

import { ssp119, ssp245 } from './modelConfigs/futureScenariosConfigs.js'
import { shaderUniformsCOP26 } from './World/systems/shaderUniforms.js';

import { plotStripes, plotLocalWarming } from "./warmingStripes/plotStripes.js";
import { findLocalModelData } from "./World/canvas/getLocalData.js";
import { optionsGUI } from './World/systems/debugGUI.js'

import { loadCMIP6CSV } from './World/systems/modelLookup.js'

import { TextureLoader } from 'three'

import * as $ from 'jquery'

async function main() {

  

  // Sidebar
  await initSidebar()

  // Three.js part of the application
  // Get a reference to the container element
  const container1 = document.querySelector('#world1');
  const container2 = document.querySelector('#world2');

 // console.log(container2.clientHeight)

  // create a new world
  const world1 = new World(container1, ssp119, "sphere", shaderUniformsCOP26);
  const world2 = new World(container2, ssp245, "sphere", shaderUniformsCOP26);

  // D3.js warming stripes based on code from
  // https://github.com/adilzeshan/warming-stripes

  const csv1 = await loadCMIP6CSV( '/modelData/CMIP6/CMIP6_onemean_ssp119/CMIP6_onemean_ssp119_GMST.1950-2100.anomaly.merged.csv' )
  const csv2 = await loadCMIP6CSV( '/modelData/CMIP6/CMIP6_onemean_ssp245/CMIP6_onemean_ssp245_GMST.1950-2100.anomaly.merged.csv' )
  // remove last empty row from array
  let popped1 = csv1.pop();
  let popped2 = csv2.pop();

  const containerStripes1 = document.querySelector("#stripes1");
  const containerStripes2 = document.querySelector("#stripes2");

  let warmingStripes1 = await plotStripes(csv1, containerStripes1);
  let warmingStripes2 = await plotStripes(csv2, containerStripes2);

  // complete async tasks
  const slider1 = document.getElementById('timeSlider1');
  const slider2 = document.getElementById('timeSlider2');
  await world1.init(slider1, shaderUniformsCOP26, undefined);
  await world2.init(slider2, shaderUniformsCOP26, world1.loop);

  // start the animation loop and intro animation
  var pauseButton = document.getElementById("playPause-button");
  var playForwardButton = document.getElementById("playForward-button");
  var playBackwardButton = document.getElementById("playBackward-button");
  pauseButton.style.color = "gray"   
  playForwardButton.style.color = "white"
  playBackwardButton.style.color = "gray"

  optionsGUI.timeAnimationOn = true
  var playIntroHelp = true

  var buttonTemp = document.querySelector("#tempOnOff")
  var buttonIce = document.querySelector("#iceOnOff")
  buttonTemp.classList.add('active')
  buttonIce.classList.add('active')

  world1.start(true, true, shaderUniformsCOP26);
  world2.start(true, false, shaderUniformsCOP26);

  world1.loop.updateEachKeyFrame.push(warmingStripes1)
  world1.loop.updateEachKeyFrame.push(warmingStripes2)

  // link controls of both worlds
  world1.controls.addEventListener( 'control', () => {

    world2.controls.rotateTo(world1.controls._spherical.theta, world1.controls._spherical.phi, false)
    world2.controls.dollyTo(world1.controls._spherical.radius, false)

  } );

  world2.controls.addEventListener( 'control', () => {

    world1.controls.rotateTo(world2.controls._spherical.theta, world2.controls._spherical.phi, false)
    world1.controls.dollyTo(world2.controls._spherical.radius, false)

  } );

// some stuff specific to the COP26 visualisation that I didn't want to have in the shared code

const loader = new TextureLoader();

const copTexture = await loader.loadAsync('/textures/COP26-logo2.jpg')

var firstTouchDetected = false;
var localPlotActive = false;

document.getElementById("worldRow").addEventListener('click', (event) => {

    event.preventDefault()

    if(firstTouchDetected == false) {

      firstTouchDetected = true;

      setTimeout(function() {
        firstTouchDetected = false
    }, 600);

    } else if (localPlotActive == false) {

      const plotDuration = 4000;

      localPlotActive = true

      setTimeout(function() {
        localPlotActive = false
    }, plotDuration);

      // Pause the animation loop
      if (optionsGUI.timeAnimationOn) {

        optionsGUI.timeAnimationOn = false
        pauseButton.style.color = "white"   
        playForwardButton.style.color = "gray"
        playBackwardButton.style.color = "gray"

      }

      const [ userLongitude, userLatitude, userModel ] = world2.sphereClick(event, world1.scene, world2.scene, plotDuration, copTexture )

      firstTouchDetected = false

       if (userLongitude != null) {

        // find local model time series
        var localData1 = findLocalModelData(world1.tasDataImage, userLongitude, userLatitude)
        var localData2 = findLocalModelData(world2.tasDataImage, userLongitude, userLatitude)

        // get maximum value for yaxis scale
        var maxValue1 = Math.max.apply(Math, localData1.map(function(o) { return o.value; }))
        var maxValue2 = Math.max.apply(Math, localData2.map(function(o) { return o.value; }))

        var maxValue = Math.ceil(Math.max(maxValue1,maxValue2))

        // plot local model time series#
        plotLocalWarming(localData1, csv1, containerStripes1, plotDuration, maxValue)
        plotLocalWarming(localData2, csv2, containerStripes2, plotDuration, maxValue)

     }

    } 
});

}

main().catch((err) => {
  console.error(err);
});

