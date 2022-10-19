import GUI from 'lil-gui';
import { Vector3 } from 'three';

import { findeClosestModelAge } from './modelLookup.js';

import { cmapID } from './initialModelConfig.js'

import gsap from 'gsap'

// Options to be added to the debug GUI
let optionsGUI = {
  timeAnimationOn: false,
  intTimePaleomap: true,
  // default: maximum of 2
  maxPixelRatio: Math.min(window.devicePixelRatio, 2),
  heightAtmosphere: 1.0,
  particleColorMode: 'none',
  timeSlider: false,
}

async function createDebugGUI(surface, atmosphere, ocean, renderer, modelConfig, gpuCompute, oceanCurrents, scene, currentsDataImage, surfaceHeightImage, loop, camera, vegGroup, shaderUniforms, timeControl, controls, controlsFP, cameraParameters) {
  
  // Initialize GUI
  const gui = new GUI( { width: 350, hideable: true, title: 'Open Controls' } );
  gui.close();

  // add ID to DOM element to easily hide GUI on smaller devices via CSS media query
  gui.domElement.setAttribute("id", "gui");

  // hide by default, show with 'h' key
  //gui.__proto__.constructor.toggleHide()

  const f1 = gui.addFolder('jet stream layer (200hPa winds)');
  f1.add(shaderUniforms.uJetStreamParticleSpeed, 'value').min(0).max(0.08).step(0.0001).name("animation speed")
  f1.add(shaderUniforms.uJetStreamSpeedMin, 'value').min(1).max(100).step(1).name("minimum speed [m/s]")
  f1.add(shaderUniforms.uJetStreamSpeedMax, 'value').min(1).max(100).step(1).name("reference speed [m/s]")
  f1.add(shaderUniforms.uJetStreamParticleCount, 'value').min(0).max(1e5).step(100).name("number of arrows")
  f1.add(shaderUniforms.uJetStreamArrowSizeState, 'value').min(0).max(5.).step(0.01).name("size of arrows")
  f1.add(shaderUniforms.uJetStreamScaleMagnitude, 'value').name("scale by magnitude")
  f1.add(shaderUniforms.uJetStreamColorMagnitude, 'value').name("color by magnitude")
  f1.close();


  const f2 = gui.addFolder('precipitation layer');
  f2.add(shaderUniforms.uPrecipitationMinValue, 'value').min(0).max(20).step(0.1).name("precip min [mm/day]")
  f2.add(shaderUniforms.uPrecipitationMaxValue, 'value').min(0).max(20).step(0.1).name("precip max [mm/day]")
  f2.close();

  const f3 = gui.addFolder('surface layer');
  // surface material properties
  f3.add(modelConfig, 'heightData', [ 'Valdes et al. (2021)', 'Scotese & Wright (1.0 deg)', 'Scotese & Wright (0.25 deg)' ]).name("paleogeography").onChange(async () => {

    let closestAge = findeClosestModelAge( timeControl, timeControl.currentTime )

    // 1. go to nearest model simulation
    gsap.to(timeControl, { duration: 0.2, ease: 'none', delay: 0, currentTime: closestAge , onComplete: async () => {

      timeControl.autoUpdateFrameWeight = false
      shaderUniforms.uFrameWeight.value = 0.0

      let initialPaleomapPlayState = optionsGUI.timeAnimationOn
      if(optionsGUI.timeAnimationOn === true) {
        optionsGUI.timeAnimationOn = false
      }

      async function changeAllHeightData() {

        for (const object of loop.updateEachKeyFrame) {
          await object.changeHeightData(timeControl.currentTimeFrame, cmapID.fillMethod, modelConfig.heightData)
        }
  
        for (const object of vegGroup) {
          await object.changeHeightData(timeControl.currentTimeFrame, cmapID.fillMethod, modelConfig.heightData)
        }

      }
    
      await changeAllHeightData();

      async function resetAllTextures() {

        for (const object of loop.updateEachKeyFrame) {
          await object.resetTextures(timeControl.currentTimeFrame, cmapID.fillMethod);
        }

        for (const object of vegGroup) {
          await object.resetTextures(timeControl.currentTimeFrame, cmapID.fillMethod);
        }

      }

      //gsap.to(shaderUniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: shaderUniforms.uNewHeightGridXOffset })
      gsap.to(shaderUniforms.uFrameWeight, { duration: 1.5, ease: 'power1.out', delay: 0, value: 1.0 , onComplete: async () => {

        await resetAllTextures()
      
        timeControl.autoUpdateFrameWeight = true

        if(initialPaleomapPlayState === true) {
          optionsGUI.timeAnimationOn = true
        }
      
      }}) 
      
    }})

  })
  f3.add(shaderUniforms.uHeightDisplacement, 'value').min(0.0).max(.8).step(0.001).name("height diplacement")
  f3.close();

  if (typeof shaderUniforms.uUserTreeScale != "undefined") {

    const f4 = gui.addFolder('vegetation layer');
    f4.add(shaderUniforms.uUserTreeScale, 'value').min(0).max(10).step(0.01).name("number of trees")
    f4.add(shaderUniforms.uUserTreeSizeScale, 'value').min(0).max(5).step(0.01).name("size of trees")
    f4.close();

  }

  if (typeof shaderUniforms.uOceanBaseMinValue != "undefined") {

    const f5 = gui.addFolder('ocean layer');
    f5.add(shaderUniforms.uOceanBaseMinValue, 'value').min(-2).max(40).step(0.1).name("SST min [°C]")
    f5.add(shaderUniforms.uOceanBaseMaxValue, 'value').min(-2).max(40).step(0.1).name("SST max [°C]")
    f5.add(shaderUniforms.uTransparentSeaIce, 'value').name("show sea ice")
    f5.close();

  }

  if (typeof shaderUniforms.uOceanParticleSpeed != "undefined") {

    const f6 = gui.addFolder('ocean currents layer');
    f6.add(shaderUniforms.uOceanParticleSpeed, 'value').min(0).max(0.1).step(0.0001).name("animation speed")
    f6.add(shaderUniforms.uSpeedMax, 'value').min(1).max(100).step(0.1).name("reference speed [cm/s]")
    f6.add(shaderUniforms.uUserOceanParticleScale, 'value').min(0).max(5).step(0.01).name("number of arrows")
    f6.add(shaderUniforms.uUserOceanParticleSizeScale, 'value').min(0).max(5.).step(0.01).name("size of arrows")
    f6.add(shaderUniforms.uScaleMagnitude, 'value').name("scale by magnitude")
    f6.add(shaderUniforms.uColorMagnitude, 'value').name("color by magnitude")
    f6.close();

  }

  // define button actions to change to first person controls
  optionsGUI.createFPC = 

    function() {

      // check than plane projection is active
      if (shaderUniforms.uSphereWrapAmount.value >= 0.5) {

        eventFire(document.getElementById('toggleProjection-button'), 'click')

        setTimeout(function() {

          activateFPC(controlsFP, controls, cameraParameters)

        }, 2000);
        

      } else {

        activateFPC(controlsFP, controls, cameraParameters)

      }

    }

  // add a button to trigger the function
  //gui.add( optionsGUI, 'createFPC' ); 	// button

}

async function createDebugGUIDune(surface, atmosphere, ocean, renderer, modelConfig, gpuCompute, oceanCurrents, scene, currentsDataImage, surfaceHeightImage, loop, camera, vegGroup, shaderUniforms, controls, controlsFP, cameraParameters) {
  
  // Initialize GUI
  const gui = new GUI( { width: 350, hideable: true, title: 'Open Controls' } );
  gui.close();

  // add ID to DOM element to easily hide GUI on smaller devices via CSS media query
  gui.domElement.setAttribute("id", "gui");

  // hide by default, show with 'h' key
  //gui.__proto__.constructor.toggleHide()

  const f1 = gui.addFolder('precipitation');
  f1.add(shaderUniforms.uPrecipitationMinValue, 'value').min(0).max(10).step(0.1).name("precip min [mm/day]")
  f1.add(shaderUniforms.uPrecipitationMaxValue, 'value').min(0).max(10).step(0.1).name("precip max [mm/day]")
  f1.close();

  const f2 = gui.addFolder('clouds');
  f2.add(shaderUniforms.uCloudsMinValue, 'value').min(0).max(1.).step(0.01).name("cloud cover min [fraction]")
  f2.add(shaderUniforms.uCloudsMaxValue, 'value').min(0).max(1.).step(0.01).name("cloud cover max [fraction]")
  f2.close();

  const f3 = gui.addFolder('surface winds');
  f3.add(shaderUniforms.uWindsParticleSpeed, 'value').min(0).max(0.08).step(0.0001).name("animation speed")
  f3.add(shaderUniforms.uWindsSpeedMax, 'value').min(1).max(30).step(0.1).name("reference speed [m/s]")
  f3.add(shaderUniforms.uUserWindsParticleScale, 'value').min(0).max(10).step(0.1).name("number of arrows")
  f3.add(shaderUniforms.uUserWindsParticleSizeScale, 'value').min(0).max(5.).step(0.1).name("size of arrows")
  f3.add(shaderUniforms.uWindsScaleMagnitude, 'value').name("scale by magnitude")
  f3.add(shaderUniforms.uWindsColorMagnitude, 'value').name("color by magnitude")
  f3.close();

  const f4 = gui.addFolder('surface temperature');
  f4.add(shaderUniforms.uTempMinValue, 'value').min(-50).max(50.).step(0.1).name("temp min [°C]")
  f4.add(shaderUniforms.uTempMaxValue, 'value').min(-50).max(50.).step(0.1).name("temp max [°C]")
  f4.close();

  const f5 = gui.addFolder('height displacement');
  // surface material properties
  f5.add(shaderUniforms.uHeightDisplacement, 'value').min(0.0).max(.5).step(0.001).name("surface height diplacement")
  f5.add(shaderUniforms.uHeightDisplacementDunes, 'value').min(0.0).max(0.3).step(0.001).name("dune height displacement")
  f5.close();

  // define function to change to first person controls
  optionsGUI.createFPC = 

    function() {

      // check than plane projection is active
      if (shaderUniforms.uSphereWrapAmount.value >= 0.5) {

        eventFire(document.getElementById('toggleProjection-button'), 'click')

        setTimeout(function() {

          activateFPC(controlsFP, cameraParameters)

        }, 2000);
        

      } else {

        activateFPC(controlsFP, cameraParameters)

      }

    }

  // add a button to trigger the function
  //gui.add( optionsGUI, 'createFPC' ); 	// button

}


async function createDebugGUIWoT(surface, atmosphere, ocean, renderer, modelConfig, gpuCompute, oceanCurrents, scene, currentsDataImage, surfaceHeightImage, loop, camera, vegGroup, shaderUniforms, controls, controlsFP, cameraParameters) {
  
  // Initialize GUI
  const gui = new GUI( { width: 350, hideable: true, title: 'Open Controls' } );
  gui.close();

  // add ID to DOM element to easily hide GUI on smaller devices via CSS media query
  gui.domElement.setAttribute("id", "gui");

  // hide by default, show with 'h' key
  //gui.__proto__.constructor.toggleHide()

  const f1 = gui.addFolder('precipitation');
  f1.add(shaderUniforms.uPrecipitationMinValue, 'value').min(0).max(30).step(0.1).name("precip min [mm/day]")
  f1.add(shaderUniforms.uPrecipitationMaxValue, 'value').min(0).max(30).step(0.1).name("precip max [mm/day]")
  f1.close();

  const f2 = gui.addFolder('clouds');
  f2.add(shaderUniforms.uCloudsMinValue, 'value').min(0).max(1.).step(0.01).name("cloud cover min [fraction]")
  f2.add(shaderUniforms.uCloudsMaxValue, 'value').min(0).max(1.).step(0.01).name("cloud cover max [fraction]")
  f2.close();

  const f3 = gui.addFolder('jet stream layer (200hPa winds)');
  f3.add(shaderUniforms.uJetStreamParticleSpeed, 'value').min(0).max(0.08).step(0.0001).name("animation speed")
  f3.add(shaderUniforms.uJetStreamSpeedMin, 'value').min(1).max(100).step(1).name("minimum speed [m/s]")
  f3.add(shaderUniforms.uJetStreamSpeedMax, 'value').min(1).max(100).step(1).name("reference speed [m/s]")
  f3.add(shaderUniforms.uJetStreamParticleCount, 'value').min(0).max(1e5).step(100).name("number of arrows")
  f3.add(shaderUniforms.uJetStreamArrowSizeState, 'value').min(0).max(5.).step(0.01).name("size of arrows")
  f3.add(shaderUniforms.uJetStreamScaleMagnitude, 'value').name("scale by magnitude")
  f3.add(shaderUniforms.uJetStreamColorMagnitude, 'value').name("color by magnitude")
  f3.close();

  const f4 = gui.addFolder('surface winds');
  f4.add(shaderUniforms.uWindsParticleSpeed, 'value').min(0).max(0.08).step(0.0001).name("animation speed")
  f4.add(shaderUniforms.uWindsSpeedMax, 'value').min(1).max(50).step(0.1).name("reference speed [m/s]")
  f4.add(shaderUniforms.uWindsSpeedMin, 'value').min(1).max(50).step(0.1).name("minimum speed [m/s]")
  f4.add(shaderUniforms.uUserWindsParticleScale, 'value').min(0).max(10).step(0.1).name("number of arrows")
  f4.add(shaderUniforms.uUserWindsParticleSizeScale, 'value').min(0).max(5.).step(0.1).name("size of arrows")
  f4.add(shaderUniforms.uWindsScaleMagnitude, 'value').name("scale by magnitude")
  f4.add(shaderUniforms.uWindsColorMagnitude, 'value').name("color by magnitude")
  f4.close();

  const f6 = gui.addFolder('height displacement');
  // surface material properties
  f6.add(shaderUniforms.uHeightDisplacement, 'value').min(0.0).max(.5).step(0.001).name("surface height diplacement")
  f6.close();

  // define function to change to first person controls
  optionsGUI.createFPC = 

    function() {

      // check than plane projection is active
      if (shaderUniforms.uSphereWrapAmount.value >= 0.5) {

        eventFire(document.getElementById('toggleProjection-button'), 'click')

        setTimeout(function() {

          activateFPC(controlsFP, cameraParameters)

        }, 2000);
        

      } else {

        activateFPC(controlsFP, cameraParameters)

      }


    }

  // add a button to trigger the function
  //gui.add( optionsGUI, 'createFPC' ); 	// button

}

async function createDebugGUINextMillion(surface, atmosphere, ocean, renderer, modelConfig, gpuCompute, oceanCurrents, scene, currentsDataImage, surfaceHeightImage, loop, camera, vegGroup, shaderUniforms, controls, controlsFP, cameraParameters) {
  
  // Initialize GUI
  const gui = new GUI( { width: 350, hideable: true, title: 'Open Controls' } );
  gui.close();

  // add ID to DOM element to easily hide GUI on smaller devices via CSS media query
  gui.domElement.setAttribute("id", "gui");

  const f4 = gui.addFolder('temperature anomaly');
  f4.add(shaderUniforms.uTempMinValue, 'value').min(-20).max(20.).step(0.1).name("temp min [°C]")
  f4.add(shaderUniforms.uTempMaxValue, 'value').min(-20).max(20.).step(0.1).name("temp max [°C]")
  f4.close();

  const f5 = gui.addFolder('height displacement');
  // surface material properties
  f5.add(shaderUniforms.uHeightDisplacement, 'value').min(0.0).max(.5).step(0.001).name("surface height diplacement")
  f5.close();

  // define function to change to first person controls
  optionsGUI.createFPC = 

    function() {

      // check than plane projection is active
      if (shaderUniforms.uSphereWrapAmount.value >= 0.5) {

        eventFire(document.getElementById('toggleProjection-button'), 'click')

        setTimeout(function() {

          activateFPC(controlsFP, cameraParameters)

        }, 2000);
        

      } else {

        activateFPC(controlsFP, cameraParameters)

      }

    }

  // add a button to trigger the function
  //gui.add( optionsGUI, 'createFPC' ); 	// button

}



function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

  // define actual function to change to first person controls
  function activateFPC(controlsFP, controls, cameraParameters) {

    cameraParameters.activateFPC = true

    // the .lock() will trigger an 'pointerlockchange' eventlistener to disable the orbit controls
    controlsFP.lock();
    //controls.enabled = false

    // move camera to surface
    gsap.to(controlsFP.getObject().position, { 

      duration: 4.5,  
      ease: 'power1', 
      delay: 0, 
      x: 0,
      y: 0.1,
      z: 0.0

    })

  }

export { createDebugGUI, createDebugGUIDune, createDebugGUINextMillion, createDebugGUIWoT, optionsGUI };
