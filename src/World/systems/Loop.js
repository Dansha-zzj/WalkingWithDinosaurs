import { Clock, Vector3 } from 'three';
import { updateTimeControl, findeAgeIndex } from './modelLookup.js'
import { optionsGUI } from './debugGUI.js'

// Performance Monitoring
// const stats = new Stats()
// stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
// stats.domElement.style.cssText = 'position:absolute;top:0px;right:0px;';
// document.body.appendChild(stats.domElement)

//var clock = new Clock();

class Loop {
  constructor(camera, scene, renderer, timeControl, optionsGUI, modelList, modelConfig, cameraParameters, csv, controls, clock) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.timeControl = timeControl;
    this.modelList = modelList;
    this.modelConfig = modelConfig;
    this.cameraParameters = cameraParameters;
    this.csv = csv;
    this.controls = controls;
    this.updateEachFrame = [];
    this.updateEachKeyFrame = [];
    this.clock = clock;

  }

  start() {


    this.renderer.setAnimationLoop(() => {

      // check wether new textures needs to be created
      this.tick();
      
      // render a frame
      this.renderer.render(this.scene, this.camera);

    });
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  // update objects and textures on each (key) frame
  tick() {

    let delta = this.clock.getDelta();

    // update some objects each frame, e.g. controls
    for (const object of this.updateEachFrame) {
      object.tickEachFrame(this.timeControl.currentTime, this.cameraParameters, delta);
    }
        
    //plotStripes.highlightActiveYear(Math.floor(this.timeControl.currentTime))

    // update age label
    if (this.timeControl.updateTimeLabel) {

      if (this.modelConfig.project === "CMIP6") {

        document.getElementById('ageLabel')
        .innerHTML = parseInt(Math.abs(this.timeControl.currentTime) )

      } else if (this.modelConfig.name === "emulator") {

        let CO2 = parseFloat( this.csv[this.timeControl.currentTimeFrame].CO2 ) + parseFloat( this.timeControl.frameWeight * ( parseFloat(this.csv[this.timeControl.currentTimeFrame + 1].CO2) - parseFloat(this.csv[this.timeControl.currentTimeFrame ].CO2 ) ) )
        document.getElementById('co2Label')
        .innerHTML = "<span style='color: gray; font-family: Courier;'>CO<sub>2</sub>: </span> " + parseInt( CO2 ) + "ppm"

        let dTEMP = parseFloat( this.csv[this.timeControl.currentTimeFrame].dT ) + parseFloat( this.timeControl.frameWeight * ( parseFloat(this.csv[this.timeControl.currentTimeFrame + 1].dT) - parseFloat(this.csv[this.timeControl.currentTimeFrame ].dT ) ) )
        document.getElementById('tempLabel')
        .innerHTML = "<span style='color: gray; font-family: Courier;'>dT:</span>&nbsp; "+ ( Math.round(dTEMP * 10) / 10 ).toFixed(1) + '&#176;C'

        // let OBL = parseFloat( this.csv[this.timeControl.currentTimeFrame].OBL ) + parseFloat( this.timeControl.frameWeight * ( parseFloat(this.csv[this.timeControl.currentTimeFrame + 1].OBL) - parseFloat(this.csv[this.timeControl.currentTimeFrame ].OBL ) ) )
        // document.getElementById('oblLabel')
        // .innerHTML = "<span style='color: gray; font-family: Courier;'>OBL: </span> " + ( Math.round(OBL * 10) / 10 ).toFixed(1) + '&#176;'

        // let RSL = parseFloat( this.csv[this.timeControl.currentTimeFrame].ICE ) + parseFloat( this.timeControl.frameWeight * ( parseFloat(this.csv[this.timeControl.currentTimeFrame + 1].ICE) - parseFloat(this.csv[this.timeControl.currentTimeFrame ].ICE ) ) )
        // document.getElementById('rslLabel')
        // .innerHTML = "<span style='color: gray; font-family: Courier;'>RSL: </span> "+ parseInt( RSL ) + "m"

        var ageLabel = document.querySelector('#ageLabel')

        if (this.timeControl.currentTime < 120) {

          ageLabel.innerHTML = parseInt(Math.abs(this.timeControl.currentTime - 120) ) + ",000 years<br>before present"

        } else if (this.timeControl.currentTime >= 1120) {

          ageLabel.innerHTML = "1,000,000 years<br>after present"

        } else {

          ageLabel.innerHTML = parseInt(Math.abs(this.timeControl.currentTime - 120) ) + ",000 years<br>after present"

        }

      } else {

        var ageLabel = document.querySelector('#ageLabel')

        if (ageLabel) {

          ageLabel.innerHTML = parseInt(Math.abs(this.timeControl.currentTime) )+this.modelConfig.timeUnit

        }

      }



    }

    if (optionsGUI.timeAnimationOn === true) {

      if (this.modelConfig.timeAnimationSpeed < 0.0) {

        this.timeControl.currentTime -= Math.abs(this.modelConfig.timeAnimationSpeed) * delta

      } else {

        this.timeControl.currentTime = parseFloat( this.timeControl.currentTime + this.modelConfig.timeAnimationSpeed * delta )

      }
  
    }


    // enable time animation loop by reversing playback at boundaries
    if (optionsGUI.timeAnimationOn && ( this.timeControl.currentTime >= this.modelConfig.timeAnimationEnd || this.timeControl.currentTime <= this.modelConfig.timeAnimationStart ) ) {

      if (this.modelConfig.experiment == "Dune" || this.modelConfig.experiment == "WoT" || this.modelConfig.experiment == "nextMillion") {

        this.timeControl.currentTime = 0.01

      } else {

        console.log('reverse')
        this.modelConfig.timeAnimationSpeed = -1.0 * this.modelConfig.timeAnimationSpeed

        var playForwardButton = document.getElementById("playForward-button");
        var playBackwardButton = document.getElementById("playBackward-button");
  
        if (playForwardButton.style.color = "white") {
  
          playForwardButton.style.color = "gray"        
          playBackwardButton.style.color = "white"        
  
        } else {
  
          playForwardButton.style.color = "white"        
          playBackwardButton.style.color = "gray"  
          
        }

      }


    }

      // constrain current time to be within [timeMin,timeMax] 
      if (this.timeControl.currentTime >= this.modelConfig.timeMax) {

        this.timeControl.currentTime = this.modelConfig.timeMax
  
      } else if (this.timeControl.currentTime <= this.modelConfig.timeMin) {
  
        this.timeControl.currentTime = this.modelConfig.timeMin
  
      }

    // 1. check if textures need updates
    //console.log(this.timeControl.currentTime+this.modelConfig.name)

    // going back in time
    if( this.timeControl.currentTime < this.timeControl.intervalTimeMin && this.timeControl.autoUpdateFrameWeight && this.updateEachKeyFrame.length > 0) { 

      // console.log('going back in time'+this.modelConfig.name)

      this.timeControl.currentTimeFrame = findeAgeIndex(this.timeControl.currentTime, this.modelList, this.modelConfig)
      this.timeControl = updateTimeControl(this.timeControl.currentTimeFrame, this.modelConfig, this.modelList, this.timeControl)

      for (const object of this.updateEachKeyFrame) {
        object.tick(this.timeControl.currentTimeFrame, 'backInTime', this.timeControl.currentTime);
      }

    // going forward in time
    } else if(this.timeControl.currentTime >= this.timeControl.intervalTimeMax && this.timeControl.autoUpdateFrameWeight && this.timeControl.currentTime != - 0.0 && this.updateEachKeyFrame.length > 0) {

      //console.log('going forward in time')

      this.timeControl.currentTimeFrame = findeAgeIndex(this.timeControl.currentTime, this.modelList, this.modelConfig)
      updateTimeControl(this.timeControl.currentTimeFrame, this.modelConfig, this.modelList, this.timeControl)

      for (const object of this.updateEachKeyFrame) {
        object.tick(this.timeControl.currentTimeFrame, 'forwardInTime', this.timeControl.currentTime);
      }
    } 

    if ( this.timeControl.currentTime >= -0.01 && this.timeControl.currentTimeFrame == 107) {
  
      this.timeControl.intervalName = 'Pre'
      this.timeControl.intervalNameLong = 'Present day (Holocene)'
      this.timeControl.currentModelID = 'teyea'

    }

    if( this.timeControl.forceUpdate ) {

      updateTimeControl(this.timeControl.currentTimeFrame + 1, this.modelConfig, this.modelList, this.timeControl)
      this.timeControl.forceUpdate = false

    }

    //console.log(this.timeControl.currentTime)

    // 2. interpolation between frames is done by shader with uFrameWeight [0-1]
    //    calculatethe newFrameWeight once, then pass it to all data layers
    let newFrameWeight = null;
    let intervalLength = null;
    let elapsedIntervalTime = null;
    
    if(optionsGUI.intTimePaleomap) {

      // time interpolation enabled
      intervalLength = this.timeControl.intervalTimeMax - this.timeControl.intervalTimeMin
      elapsedIntervalTime = this.timeControl.currentTime - this.timeControl.intervalTimeMin
      newFrameWeight = elapsedIntervalTime / intervalLength

    } else {

      // time interpolation disabled
      newFrameWeight = 0.0

    }

    this.timeControl.frameWeight = newFrameWeight

    if(this.timeControl.currentTime != 0.0 && this.timeControl.autoUpdateFrameWeight) {

      for (const object of this.updateEachKeyFrame) {
  
        if (typeof object.variables !== 'undefined') {
          // gpuCompute object
          object.variables[0].material.uniforms.uFrameWeight.value = newFrameWeight
      } else if (typeof object.material !== 'undefined') {
        if (typeof object.material.userData.uFrameWeight !== 'undefined') {

          object.material.userData.uFrameWeight.value = newFrameWeight

        } else {

          object.material.uniforms.uFrameWeight.value = newFrameWeight

        }

      }
      
    }
    }
  }
}

export { Loop };
