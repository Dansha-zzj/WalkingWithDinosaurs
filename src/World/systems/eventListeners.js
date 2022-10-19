import { toggleProjectionWrap } from './projection.js';
import { spinGlobe } from './controls.js';
import { cmapID, oceanCurrentParameters } from '../systems/initialModelConfig.js'
import { findeClosestModelAge } from './modelLookup.js';
import { requestData } from "../../setup-graphing";
import * as $ from 'jquery'
import gsap from 'gsap'

function initListeners(controls, camera, mouse, container, loop, optionsGUI, renderer, scene, oceanCurrents, gpuComputeOcean, currentsDataImage, surfaceHeightImage, ocean, surface, precipitation, clouds, timeSlider, vegGroup, initialPositionsOcean, winds, jetStream, modelConfig, shaderUniforms, timeControl, cameraParameters, world, resizer) {

var projectionButton = document.querySelector("#toggleProjection-button")

if(projectionButton){

  projectionButton.addEventListener('click',() => {

    var spinGlobeButton = document.getElementById('spinGlobe-button')

    // from plane to sphere
    if (shaderUniforms.uSphereWrapAmount.value <= 0.5) {

      projectionButton.style.color = "white"

    } else {

      // turn off spinning
      if (spinGlobeButton.style.color === "white") {
        spinGlobe(cameraParameters);
      } 

      projectionButton.style.color = "gray"
      spinGlobeButton.style.color = "gray"

    }

    toggleProjectionWrap(controls, camera, 'equator', shaderUniforms);

  });

}

var buttonHomeView = document.querySelector("#homeView-button")

if(buttonHomeView){

  buttonHomeView.addEventListener('click',() => {

    controls.reset(true)

  });

}

  // only one eventlistener for CMIP6 2-globe configuration
  if (modelConfig.name != "CMIP6_onemean_ssp245" ) {

    document.getElementById('spinGlobe-button').addEventListener('click',() => {

      var spinGlobeButton = document.getElementById('spinGlobe-button')
  
      // sphere is selected
      if (shaderUniforms.uSphereWrapAmount.value >= 0.5) {
    
        if (spinGlobeButton.style.color === "white") {
          spinGlobeButton.style.color = "gray"
        } else {
          spinGlobeButton.style.color = "white"
        }
        spinGlobe(cameraParameters);
  
      } 
      
    });

  }


  const layerAnimationDuration = 1.5
  const layerAnimationEasing = 'power1'
  const layerAnimationDurationAtmosphere = 1.0
  const layerAnimationEasingAtmosphere = 'power4'
//  const layerAnimationEasingAtmosphere = CustomEase.create("custom", "M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.492,0.963 0.5,1 0.508,0.985 0.526,0.96 0.574,0.904 0.636,0.83 0.66,0.866 0.682,0.904 0.729,0.985 0.719,0.981 0.726,0.998 0.788,0.914 0.84,0.936 0.859,0.95 0.878,0.964 0.897,0.985 0.911,0.998 0.922,0.994 0.939,0.984 0.954,0.984 0.969,0.984 1,1 1,1 ")

var buttonWinds = document.querySelector("#windsOnOff")

if(buttonWinds){

  buttonWinds.addEventListener('click',() => {

    if (buttonWinds.disabled != true) {

      if (shaderUniforms.uWindsParticleOpacity.value === 0.0) {

        buttonWinds.classList.add('active')


        if (optionsGUI.introMode) {

          shaderUniforms.uHeightWinds.value = 3.
          gsap.to(shaderUniforms.uHeightWinds, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: shaderUniforms.uHeightWindsState.value } )
          gsap.to(shaderUniforms.uWindsParticleOpacity, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: 1.0 })

        } else {

          scene.add(winds)
    
          gsap.to(shaderUniforms.uWindsParticleOpacity, { duration: layerAnimationDurationAtmosphere / 2., ease: 'power1', value: 1.0 })

        }

      } else if (shaderUniforms.uWindsParticleOpacity.value === 1.0) {

        buttonWinds.classList.remove('active')

        gsap.to(shaderUniforms.uWindsParticleOpacity, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0, onComplete: () => { scene.remove(winds) }})

      }

      buttonWinds.disabled = true

      setTimeout(function(){ buttonWinds.disabled = false; }, layerAnimationDuration);

    }
    
  })
  
};

var buttonJetStream = document.querySelector("#jetStreamOnOff")

if(buttonJetStream){

  buttonJetStream.addEventListener('click',() => {

    if (buttonJetStream.disabled != true) {

      if (shaderUniforms.uJetStreamParticleOpacity.value === 0.0) {

        buttonJetStream.classList.add('active')


        if (optionsGUI.introMode) {

          console.log('turn on intro')

          shaderUniforms.uHeightJetStream.value = 3.
          gsap.to(shaderUniforms.uHeightJetStream, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: shaderUniforms.uHeightJetStreamState.value } )
          gsap.to(shaderUniforms.uJetStreamParticleOpacity, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: 1.0 })

        } else {

          scene.add(jetStream)
    
          gsap.to(shaderUniforms.uJetStreamParticleOpacity, { duration: layerAnimationDurationAtmosphere / 2., ease: 'power1', value: 1.0 })

        }

      } else if (shaderUniforms.uJetStreamParticleOpacity.value === 1.0) {

        buttonJetStream.classList.remove('active')

        gsap.to(shaderUniforms.uJetStreamParticleOpacity, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0, onComplete: () => { scene.remove(jetStream) }})

      }

      buttonJetStream.disabled = true

      setTimeout(function(){ buttonJetStream.disabled = false; }, layerAnimationDuration);

    }
    
  })
  
};

var buttonPrecip = document.querySelector("#precipOnOff")

if(buttonPrecip){

  buttonPrecip.addEventListener('click',() => {

    // COP26 model layers are handled in cop26.js

      if (buttonPrecip.disabled != true) {

        if (shaderUniforms.uOpacityPrecipitation.value === 0.0) {

          buttonPrecip.classList.add('active')
    
          if (optionsGUI.introMode) {
    
            shaderUniforms.uHeightPrecipitation.value = 3.
            gsap.to(shaderUniforms.uHeightPrecipitation, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: shaderUniforms.uHeightPrecipitationState.value } )
            gsap.to(shaderUniforms.uOpacityPrecipitation, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: shaderUniforms.uOpacityPrecipitationState.value })
    
          } else {
    
            if (modelConfig.project != "CMIP6") {

              scene.add(precipitation)
            
            }
      
            gsap.to(shaderUniforms.uOpacityPrecipitation, { duration: layerAnimationDurationAtmosphere / 2., ease: 'power1', value: shaderUniforms.uOpacityPrecipitationState.value })
    
          }
    
        } else if (shaderUniforms.uOpacityPrecipitation.value === shaderUniforms.uOpacityPrecipitationState.value) {
    
          buttonPrecip.classList.remove('active')
    
          if (modelConfig.project != "CMIP6") {

            gsap.to(shaderUniforms.uOpacityPrecipitation, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0, onComplete: () => { scene.remove(precipitation) }})

          } else {

            gsap.to(shaderUniforms.uOpacityPrecipitation, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0 })

          }

    
        }

        buttonPrecip.disabled = true

        setTimeout(function(){ buttonPrecip.disabled = false; }, layerAnimationDuration);

      }
    
  });

}

var buttonClouds = document.querySelector("#cloudsOnOff")

if(buttonClouds){

  buttonClouds.addEventListener('click',() => {

    // COP26 model layers are handled in cop26.js

      if (buttonClouds.disabled != true) {

        if (shaderUniforms.uOpacityClouds.value === 0.0) {

          buttonClouds.classList.add('active')
    
          if (optionsGUI.introMode) {
    
            shaderUniforms.uHeightClouds.value = 3.
            gsap.to(shaderUniforms.uHeightClouds, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: shaderUniforms.uHeightCloudsState.value } )
            gsap.to(shaderUniforms.uOpacityClouds, { duration: layerAnimationDurationAtmosphere, ease: layerAnimationEasingAtmosphere, value: shaderUniforms.uOpacityCloudsState.value })
    
          } else {
    
            if (modelConfig.project != "CMIP6") {

              scene.add(clouds)
            
            }
      
            gsap.to(shaderUniforms.uOpacityClouds, { duration: layerAnimationDurationAtmosphere / 2., ease: 'power1', value: shaderUniforms.uOpacityCloudsState.value })
    
          }
    
        } else if (shaderUniforms.uOpacityClouds.value === shaderUniforms.uOpacityCloudsState.value) {
    
          buttonClouds.classList.remove('active')
    
          if (modelConfig.project != "CMIP6") {

            gsap.to(shaderUniforms.uOpacityClouds, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0, onComplete: () => { scene.remove(clouds) }})

          } else {

            gsap.to(shaderUniforms.uOpacityClouds, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0 })

          }

    
        }

        buttonClouds.disabled = true

        setTimeout(function(){ buttonClouds.disabled = false; }, layerAnimationDuration);

      }
    
  });

}

var buttonIce = document.querySelector("#iceOnOff")

if(buttonIce){

  buttonIce.addEventListener('click',() => {

        
    console.log(shaderUniforms.uOpacityIce.value)
    console.log(shaderUniforms.uOpacityIceState.value)
    console.log(buttonIce.disabled)

      if (buttonIce.disabled != true) {

        console.log('0')

        if (shaderUniforms.uOpacityIce.value === 0.0) {

          console.log('1')

          buttonIce.classList.add('active')
    
          if (modelConfig.project != "CMIP6" && modelConfig.name != "emulator") {

            scene.add(ice)
          
          }
    
          gsap.to(shaderUniforms.uOpacityIce, { duration: layerAnimationDurationAtmosphere / 2., ease: 'power1', value: shaderUniforms.uOpacityIceState.value })
    
    
        } else if (shaderUniforms.uOpacityIce.value === shaderUniforms.uOpacityIceState.value) {

          console.log('2')

          buttonIce.classList.remove('active')

          if (modelConfig.project != "CMIP6" && modelConfig.name != "emulator") {

            gsap.to(shaderUniforms.uOpacityIce, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0, onComplete: () => { scene.remove(ice) }})

          } else {

            gsap.to(shaderUniforms.uOpacityIce, { duration: layerAnimationDuration / 2. , ease: 'power1', value: 0.0 })

          }

    
        } else {

          console.log('3')
          
        }

      }

        buttonIce.disabled = true

        setTimeout(function(){ buttonIce.disabled = false; }, layerAnimationDuration);

      }
    
  );

}

var buttonSurface = document.querySelector("#surfcOnOff")

if(buttonSurface){

  buttonSurface.addEventListener('click',() => {

    if (buttonSurface.disabled != true) {

      if (shaderUniforms.uOpacitySurface.value === 0.0) {

        if (modelConfig.experiment != "Dune") {

          buttonSurface.classList.add('active')

        }

        if (modelConfig.project != "CMIP6") {

          scene.add(surface)

        }

        gsap.to(shaderUniforms.uOpacitySurface, { duration: layerAnimationDuration, ease: layerAnimationEasing, value: 1.0 } )

      } else if (shaderUniforms.uOpacitySurface.value === 1.0) {

        if (modelConfig.experiment != "Dune") {

          buttonSurface.classList.remove('active')

        }

        if (modelConfig.project != "CMIP6") {


          gsap.to(shaderUniforms.uOpacitySurface, { duration: layerAnimationDuration, ease: layerAnimationEasing, value: 0.0, onComplete: () => { 
            scene.remove(surface) 
          }})
      
        } else {

          gsap.to(shaderUniforms.uOpacitySurface, { duration: layerAnimationDuration, ease: layerAnimationEasing, value: 0.0 })
          
        }

      }

      buttonSurface.disabled = true

      setTimeout(function(){ buttonSurface.disabled = false; }, layerAnimationDuration);

    }

  });

}

var buttonVeg = document.querySelector("#vegOnOff")

if(buttonVeg){

  buttonVeg.addEventListener('click',() => {

    if (buttonVeg.disabled != true) {

      var vegLayerAnimationDuration =  layerAnimationDuration

      if (shaderUniforms.uTreeSize.value === 0.0) {

        buttonVeg.classList.add('active')

        if (optionsGUI.introMode == false) {

          for (const object of vegGroup) {
            scene.add(object); 
          }

          vegLayerAnimationDuration = 2.5

        }

        gsap.to(shaderUniforms.uTreeSize, { duration: vegLayerAnimationDuration, ease: layerAnimationEasing, value: shaderUniforms.uTreeSizeState.value })
        gsap.to(shaderUniforms.uPFTsWeight, { duration: vegLayerAnimationDuration, ease: layerAnimationEasing, value: 1. } )

      } else if (shaderUniforms.uTreeSize.value != 0.0) {

        buttonVeg.classList.remove('active')

        cameraParameters.updateOnZoom = false

        gsap.to(shaderUniforms.uTreeSize, { duration: vegLayerAnimationDuration, ease: layerAnimationEasing, value: 0.0, onComplete: () => { 

          for (const object of vegGroup) {
            scene.remove(object); 
          }

        }})
        gsap.to(shaderUniforms.uPFTsWeight, { duration: vegLayerAnimationDuration, ease: layerAnimationEasing, value: 0. } )

      }

      buttonVeg.disabled = true

      setTimeout(function(){ buttonVeg.disabled = false; }, layerAnimationDuration);

    }

  });

}


var buttonTemp = document.querySelector("#tempOnOff")

if(buttonTemp){

  buttonTemp.addEventListener('click',() => {


    if (buttonTemp.disabled != true) {

      var tempLayerAnimationDuration = layerAnimationDuration

      if (shaderUniforms.uOpacityTemp.value === 0.0) {

        buttonTemp.classList.add('active')

        if (optionsGUI.introMode == false && modelConfig.name == "PALEOMAP_FosterCO2_scotese_02") {

          scene.add(ocean)

        } else {

          tempLayerAnimationDuration = 2.5

        }

        gsap.to(shaderUniforms.uOpacityTemp, { duration: tempLayerAnimationDuration, ease: layerAnimationEasing, value: 1.0 } )

      } else if (shaderUniforms.uOpacityTemp.value === 1.0) {

        buttonTemp.classList.remove('active')

        if (modelConfig.name == "PALEOMAP_FosterCO2_scotese_02") {

          gsap.to(shaderUniforms.uOpacityTemp, { duration: tempLayerAnimationDuration, ease: layerAnimationEasing, value: 0.0 , onComplete: () => { scene.remove(ocean) }})

        } else {

          gsap.to(shaderUniforms.uOpacityTemp, { duration: tempLayerAnimationDuration, ease: layerAnimationEasing, value: 0.0 })

        }
      }

      buttonTemp.disabled = true

      setTimeout(function(){ buttonTemp.disabled = false; }, layerAnimationDuration);

    }

  });

}



var buttonOcean = document.querySelector("#oceanOnOff")

if(buttonOcean){

  buttonOcean.addEventListener('click',() => {

    if (buttonOcean.disabled != true) {

      var oceanLayerAnimationDuration = layerAnimationDuration

      if (shaderUniforms.uOpacityOcean.value === 0.0) {

        buttonOcean.classList.add('active')

        if (optionsGUI.introMode == false) {

          scene.add(ocean)

        } else {

          oceanLayerAnimationDuration = 2.5

        }

        gsap.to(shaderUniforms.uDepthOcean, { duration: oceanLayerAnimationDuration, ease: layerAnimationEasing, value: 0.0 } )
        gsap.to(shaderUniforms.uOpacityOcean, { duration: oceanLayerAnimationDuration, ease: layerAnimationEasing, value: 1.0 } )

      } else if (shaderUniforms.uOpacityOcean.value === 1.0) {

        buttonOcean.classList.remove('active')

        gsap.to(shaderUniforms.uDepthOcean, { duration: oceanLayerAnimationDuration, ease: layerAnimationEasing, value: 0.2 })
        gsap.to(shaderUniforms.uOpacityOcean, { duration: oceanLayerAnimationDuration, ease: layerAnimationEasing, value: 0.0 , onComplete: () => { scene.remove(ocean) }})

      }

      buttonOcean.disabled = true

      setTimeout(function(){ buttonOcean.disabled = false; }, layerAnimationDuration);

    }

  });

}

var buttonCurrents = document.querySelector("#currentsOnOff")

if(buttonCurrents){

  buttonCurrents.addEventListener('click',async () => {

    if (buttonCurrents.disabled != true) {

      if (oceanCurrentParameters.enable === true) {

        buttonCurrents.classList.remove('active')
      
        gsap.to(shaderUniforms.uOceanParticleOpacity, { duration: 1., ease: layerAnimationEasing, value: 0.0 , onComplete: () => { 
          scene.remove(oceanCurrents)
          oceanCurrentParameters.enable = false

        }})
        gsap.to(shaderUniforms.uDarkerOcean, { duration: 1., ease: layerAnimationEasing, value: 0.0 })  

      } else {

        buttonCurrents.classList.add('active')

        scene.add(oceanCurrents); 

        oceanCurrentParameters.enable = true

        gsap.to(shaderUniforms.uOceanParticleOpacity, { duration: 1., ease: layerAnimationEasing, value: 1.0 }) 


        if (shaderUniforms.uColorMagnitude.value === true) {

          gsap.to(shaderUniforms.uDarkerOcean, { duration: 1., ease: layerAnimationEasing, value: 2.0 }) 

        } else {

          gsap.to(shaderUniforms.uDarkerOcean, { duration: 1., ease: layerAnimationEasing, value: 1.0 }) 

        }

      }

      buttonCurrents.disabled = true

      setTimeout(function(){ buttonCurrents.disabled = false; }, layerAnimationDuration);

    }

  });

}

var buttonDunes = document.querySelector("#dunesOnOff")

if(buttonDunes){

  buttonDunes.addEventListener('click',() => {

    if (buttonDunes.disabled != true) {

      if (shaderUniforms.uOpacityDunes.value === 0.0) {

        buttonDunes.classList.add('active')

        gsap.to(shaderUniforms.uOpacityDunes, { duration: layerAnimationDuration, ease: layerAnimationEasing, value: 1.0 } )

      } else if (shaderUniforms.uOpacityDunes.value === 1.0) {

        buttonDunes.classList.remove('active')

        gsap.to(shaderUniforms.uOpacityDunes, { duration: layerAnimationDuration, ease: layerAnimationEasing, value: 0.0 })
          
      }

      buttonDunes.disabled = true

      setTimeout(function(){ buttonDunes.disabled = false; }, layerAnimationDuration);
 
    }

  })

}

  // Time animation UI buttons
  var pauseButton = document.getElementById("playPause-button");
  var playForwardButton = document.getElementById("playForward-button");
  var playBackwardButton = document.getElementById("playBackward-button");

    // Play/pause button

    pauseButton.addEventListener("click", function() {
  
        // Pause the animation loop
        optionsGUI.timeAnimationOn = false
        pauseButton.style.color = "white"   
        playForwardButton.style.color = "gray"

        if(playBackwardButton) {

          playBackwardButton.style.color = "gray"
  
        }

    });

  // Play backwards button

  if(playBackwardButton){

    playBackwardButton.addEventListener("click", function() {

        // Start the animation loop
        optionsGUI.timeAnimationOn = true
        pauseButton.style.color = "gray"   
        playForwardButton.style.color = "gray"
        playBackwardButton.style.color = "white"

        // Set negative time step 
        modelConfig.timeAnimationSpeed = -1.0 * Math.abs(modelConfig.timeAnimationSpeed)
        
    });

  }

  // Play forward button
  playForwardButton.addEventListener("click", function() {

      // Start the animation loop
      optionsGUI.timeAnimationOn = true
      pauseButton.style.color = "gray"   
      playForwardButton.style.color = "white"

      if(playBackwardButton) {

        playBackwardButton.style.color = "gray"

      }

      // Set positive time step 
      modelConfig.timeAnimationSpeed = Math.abs(modelConfig.timeAnimationSpeed)

  });

    // Plus/minus buttons
    var plusButton = document.getElementById("playPlus-button");
    var minusButton = document.getElementById("playMinus-button");
    var buttonTimer;

    plusButton.addEventListener("click", function() {

      // Increase animation speed
      if (modelConfig.timeAnimationSpeed >= 0.0) {

        modelConfig.timeAnimationSpeed += modelConfig.timeAnimationSpeedDelta
      
      } else {

        modelConfig.timeAnimationSpeed -= modelConfig.timeAnimationSpeedDelta

      }

    // display animation speed
    timeControl.updateTimeLabel = false
    var ageLabel = document.querySelector('#ageLabel')
    
    if (ageLabel) {

      if (modelConfig.name === "emulator") {

        ageLabel.innerHTML = parseFloat(Math.abs(modelConfig.timeAnimationSpeed))+''+modelConfig.timeUnit+' years/s'

      } else {

        ageLabel.innerHTML = parseFloat(Math.abs(modelConfig.timeAnimationSpeed))+' '+modelConfig.timeUnit+'/s'

      }
 
    }    
    // remove animation speed label after 2 seconds
    clearTimeout(buttonTimer);
    buttonTimer = setTimeout(function(){
      timeControl.updateTimeLabel = true;
    }, 2000);

  });

  minusButton.addEventListener("click", function() {

    // Decrease animation speed
    if (modelConfig.timeAnimationSpeed > .1) {

      modelConfig.timeAnimationSpeed -= modelConfig.timeAnimationSpeedDelta

    } else if (Math.abs(modelConfig.timeAnimationSpeed) <= 0.1) {

      // don't reduce speed any further

    } else {

      modelConfig.timeAnimationSpeed += modelConfig.timeAnimationSpeedDelta

    }

    // display animation speed
    timeControl.updateTimeLabel = false
    var ageLabel = document.querySelector('#ageLabel')

    if (ageLabel) {

      ageLabel.innerHTML = parseFloat(Math.abs(modelConfig.timeAnimationSpeed))+' '+modelConfig.timeUnit+'/s'
 
    }

    // remove animation speed label after 2 seconds
    clearTimeout(buttonTimer);
    buttonTimer = setTimeout(function(){
      timeControl.updateTimeLabel = true;
    }, 2000);

});

  // change texture filtering
  var textureFilteringButton = document.querySelector("#toggleFilter-button");
  let oldFilter = null;

if(textureFilteringButton){

  textureFilteringButton.addEventListener("click", function() {

    let closestAge = findeClosestModelAge( timeControl, timeControl.currentTime )

    // 1. go to nearest model simulation
    gsap.to(timeControl, { duration: 0.2, ease: 'none', delay: 0, currentTime: closestAge , onComplete: async () => {

      timeControl.autoUpdateFrameWeight = false
      shaderUniforms.uFrameWeight.value = 0.0

      let initialPaleomapPlayState = optionsGUI.timeAnimationOn
      if(optionsGUI.timeAnimationOn === true) {
        optionsGUI.timeAnimationOn = false
      }

      let newHeightDisplacement

      if (cmapID.fillMethod == 'LinearFilter') {

        oldFilter = 'LinearFilter'
        cmapID.fillMethod = 'NearestFilter'
        shaderUniforms.uHeightDisplacementState.value = shaderUniforms.uHeightDisplacement.value
        newHeightDisplacement = 0.0

        textureFilteringButton.style.color = "white"

        if (modelConfig.heightData === 'Scotese & Wright (0.25 deg)') {

          modelConfig.gridMultiplier = 2

        } else if (modelConfig.heightData === 'Scotese & Wright (1.0 deg)') {

          modelConfig.gridMultiplier = 4

        } else {

          modelConfig.gridMultiplier = 8

        }
        surface.setGeometryResolution()

      } else {

        oldFilter = 'NearestFilter'
        cmapID.fillMethod = 'LinearFilter'
        newHeightDisplacement = shaderUniforms.uHeightDisplacementState.value

        textureFilteringButton.style.color = "gray"

        modelConfig.gridMultiplier = 2
        surface.setGeometryResolution()
        
      }

      for (const object of loop.updateEachKeyFrame) {
        object.changeFilter(timeControl.currentTimeFrame, oldFilter, cmapID.fillMethod);
      }

      if (modelConfig.enablePFTs) {
          
        for (const object of vegGroup) {
          object.changeFilter(timeControl.currentTimeFrame, oldFilter, cmapID.fillMethod);
        }

      }

      async function resetAllTextures() {

        for (const object of loop.updateEachKeyFrame) {
          await object.resetTextures(timeControl.currentTimeFrame, cmapID.fillMethod);
        }

        if (modelConfig.enablePFTs) {

          for (const object of vegGroup) {
            await object.resetTextures(timeControl.currentTimeFrame, cmapID.fillMethod);
          }

        }

      }

      gsap.to(shaderUniforms.uFrameWeight, { duration: 1.5, ease: 'power1.out', delay: 0, value: 1.0 , onComplete: () => {

          resetAllTextures()

          timeControl.autoUpdateFrameWeight = true
          
        }}) 
      
   //     gsap.to(shaderUniforms.uHeightDisplacement, { duration: 1.5, ease: 'power1.out', delay: 0, value: newHeightDisplacement })


      if(initialPaleomapPlayState === true) {
        optionsGUI.timeAnimationOn = true
      }

    }}) 

    });
  
}

// user input of comma-separated location markers
var userCSVInputButton = document.querySelector("#toggleUserCSVInput-button");

if(userCSVInputButton){

  userCSVInputButton.addEventListener("click", function() {

    console.log(userCSVInputButton.style.color)

    if (userCSVInputButton.style.color == "gray" || userCSVInputButton.style.color == "") {

      userCSVInputButton.style.color = "white"

      document.getElementById("csvLocations").style.display = "block"

    } else {

      userCSVInputButton.style.color = "gray"

      document.getElementById("csvLocations").style.display = "none"
    
    }

  })

}

var userCSVButton = document.querySelector("#userCSVButton");

if(userCSVButton){

  // Returns a Promise that resolves after "ms" Milliseconds
  const timer = ms => new Promise(res => setTimeout(res, ms))

  userCSVButton.addEventListener("click", async function() {

    // parse user input

    // first check whether CSV input has been specified

    var lines = document.getElementById("csvTextarea").value.split("\n");

    var splitCSV = lines[0].split(",").filter(o=>o)

    var singleMarkerAgeInput = parseFloat(document.getElementById("singleMarkerAgeInput").value)
    var singleMarkerLatInput = parseFloat(document.getElementById("singleMarkerLatInput").value)
    var singleMarkerLonInput = parseFloat(document.getElementById("singleMarkerLonInput").value)

    // try to read single user location if no CSV input has been specified
    if ( splitCSV.length == 0 ) {

      // no data at all found
      if ( ( isNaN(singleMarkerAgeInput) ) && ( isNaN(singleMarkerLatInput) ) && ( isNaN(singleMarkerLonInput) ) ) {

        alert("Please specify first a single or a list of locations!")
        // exit function
        return

      // single location found
      } else {

        // translate user input into CSV format to use same processing
        lines = [ String(singleMarkerAgeInput) + "," + String(singleMarkerLatInput) + "," + String(singleMarkerLonInput) ] 
        console.log(lines)       

      }

    } else {

      // single location user input found in addition to CSV input
      if ( ( isNaN(singleMarkerAgeInput) == false ) || ( isNaN(singleMarkerLatInput) == false ) || ( isNaN(singleMarkerLonInput) == false ) ) {

        alert("Please specify either a single or a list of locations, not both!")
        // exit function
        return

      }

    }

    // check for length of input CSV
    if ( lines.length > 100 ) {

      alert("Error: Input exceeds maximum of 100 input locations.\n\nStopping CSV processing now!")
      // exit function
      return

    }

    // if we reach this point some valid marker input is found and we can prepare some thjings

    // hide marker pop up
    var userCSVInputButton = document.querySelector("#toggleUserCSVInput-button");
    userCSVInputButton.style.color = "gray"
    document.getElementById("csvLocations").style.display = "none"

    // deactivate ocean temperature layer
    if (buttonOcean.classList.contains("active")) {

      buttonOcean.click()

    }

    // get user-selected variable
    document.getElementById("variable-selector").value = document.getElementById("csvVariableSelector").value


    for (var i = 0; i < lines.length; i++) {

      var items = lines[i].split(",");

      // check that line has exactly 3 columns
      if (items.length != 3) {

        alert("Error in line " + String(i+1) + ": " + String(items.length) + " columns found, three columns were expected.\n\nStopping CSV processing now!")
        // exit function
        return

      }

      // generate unique ID for location
      var modernLon = parseFloat(items[2]);
      var modernLat = parseFloat(items[1]);
      var age =  -1.0 * parseFloat(items[0]);

      // check for valid age input
      if ( ( isNaN(age)) || ( age < -542 ) || ( age > 0 ) ) {

        alert("Error in line " + String(i+1) + ": input age must be between 0 and 542 Ma.\n\nStopping CSV processing now!")
        // exit function
        return

      }

      // check for valid latitude input
      if ( ( isNaN(modernLat)) || ( modernLat < -90 ) || ( modernLat > 90 ) ) {

        alert("Error in line " + String(i+1) + ": input latitude must be between -90 and 90 (i.e., 90S to 90N).\n\nStopping CSV processing now!")
        // exit function
        return

      }

      // check for valid latitude input
      if ( ( isNaN(modernLon)) || ( modernLon < -180 ) || ( modernLon > 180 ) ) {

        alert("Error in line " + String(i+1) + ": input longitude must be between -180 and 180 (i.e., 180W to 180E).\n\nStopping CSV processing now!")
        // exit function
        return

      }

      console.log('marker : '+String(i))

      const closestModelAge = findeClosestModelAge(timeControl, age);

      age = closestModelAge

      // find paleolocations for modern input data
      const [ paleoLat, paleoLon, paleoModelID, paleoPeriod, paleoPeriodLong ] = await world.rotateToPast(age, modernLat, modernLon)

      // get valid (i.e. maximum) age of location
      const [ validAge ] = await world.findValidAgeTexture(modernLat, modernLon)

      // check that requested age is smaller than validAge
      if ( Math.abs(age) > Math.abs(validAge) ) {

        alert("Error in line " + String(i+1) + ": " +' requested age of ' + String(Math.abs(age.toFixed(1))) + " Ma is larger than seafloor age of " + String(Math.abs(validAge.toFixed(1))) + " Ma at location:\n\nLAT: " + String(modernLat.toFixed(1)) + " / LON: " + String(modernLon.toFixed(1)) +"\n\nStopping CSV processing now!")
        // exit function
        return

      }

      // focus camera on marker if only one point is selcetd 
      if (lines.length== 1) {

        world.goToPlace(world.controls, modernLat, modernLon, shaderUniforms);

      }

      const markerRotationFlag = true

      var lonCoarse = Math.round(paleoLon);
      var latCoarse = Math.round(paleoLat);

      var locationID = String(paleoModelID) + '/' + String(latCoarse) + '/' + String(lonCoarse)
    
      requestData(
        latCoarse, 
        lonCoarse, 
        paleoLat, 
        paleoLon, 
        String(paleoModelID), 
        String(paleoPeriod), 
        String(paleoPeriodLong), 
        "Valdes et al (2021)",
        locationID, 
        shaderUniforms, 
        age, 
        validAge,
        markerRotationFlag,
        false, 
        Math.round(modernLat), 
        Math.round(modernLon) );

      console.log(locationID)

      // wait to fetch data
      //await timer(300)
      document.getElementById("pointer-plot").click()
      var selectedMarker = scene.getObjectByName(locationID);
      selectedMarker.material.uniforms.uRotateMarker.value = true
      selectedMarker.material.uniforms.uMarkerAnimate.value = true
      selectedMarker.material.uniforms.uModernLat.value = modernLat
      selectedMarker.material.uniforms.uModernLon.value = modernLon

      shaderUniforms.uMarkerBuildTime.value = 5.0
      gsap.to(shaderUniforms.uMarkerBuildTime, { duration: .2, ease: 'power4', delay: 0, value: 0.0, onComplete: () => {
      
        selectedMarker.material.uniforms.uMarkerAnimate.value = false

      }})
      await timer(500)

    }

    // display animation with 8 Ma / second
    const timeDiff = Math.abs( Math.abs(age) - Math.abs(timeControl.currentTime) )
    const animationLength = timeDiff / 8.
    console.log(animationLength)

    gsap.to(timeControl, { duration: animationLength, ease: 'linear', delay: 0, currentTime: age, onComplete: async () => {
      

      // show graph
      await timer(1000)
      const graphDisplay = document.getElementById("graph-display");
      const bodypd = document.getElementById("container-fluid");
      const timepd = document.getElementById("timeControls");
      const pointerpd = document.getElementById("pointer");

      document.getElementById("graph-display").style.display = "block";

      if (!graphDisplay.classList.contains("graph-display-show")) {
        graphDisplay.classList.toggle("graph-display-hide");
        graphDisplay.classList.toggle("graph-display-show");
        bodypd.classList.toggle("container-fluid-pd-right");
        timepd.classList.toggle("timeRow-pd-right");
        pointerpd.classList.toggle("pointer-pd-right");
      }

    }})
    

  })

}

// fullscreen button
// from https://stackoverflow.com/questions/7130397/how-do-i-make-a-div-full-screen
$('#toggle_fullscreen').on('click', function(){
  // if already full screen; exit
  // else go fullscreen
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    var element
    console.log(modelConfig.project)
    if (modelConfig.project == "CMIP6") {
      element = $('#worldRow').get(0);
    } else {
      element = $('#world').get(0);
    }
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
})

// user input of comma-separated location markers
var screenshotButton = document.querySelector("#screenshot-button");

if(screenshotButton){

  screenshotButton.addEventListener("click", function() {

    resizer.takeScreenshot()

  })

}

  window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX /  container.clientWidth * 2 - 1
    mouse.y = - (event.clientY /  container.clientHeight) * 2 + 1
})


// listeners to detect first person controls (pointerLockControls)

// from https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
const onKeyDown = function ( event ) {

  // only activate if orbit controls are disabled
  if (cameraParameters.FPCenabled) {

    switch ( event.code ) {

      case 'ArrowUp':
      case 'KeyW':
        cameraParameters.moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        cameraParameters.moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        cameraParameters.moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        cameraParameters.moveRight = true;
        break;

      case 'KeyR':
        cameraParameters.moveUp = true;
        break;  

      case 'KeyF':
        cameraParameters.moveDown = true;
        break;  
    }

}

};

const onKeyUp = function ( event ) {

  switch ( event.code ) {

    case 'ArrowUp':
    case 'KeyW':
      cameraParameters.moveForward = false;
      break;

    case 'ArrowLeft':
    case 'KeyA':
      cameraParameters.moveLeft = false;
      break;

    case 'ArrowDown':
    case 'KeyS':
      cameraParameters.moveBackward = false;
      break;

    case 'ArrowRight':
    case 'KeyD':
      cameraParameters.moveRight = false;
      break;

    case 'KeyR':
      cameraParameters.moveUp = false;
      break;  

    case 'KeyF':
      cameraParameters.moveDown = false;
      break;  

  }

};

document.addEventListener( 'keydown', onKeyDown );
document.addEventListener( 'keyup', onKeyUp );

// event listsner to switch between first person and orbit controls
document.addEventListener( 'pointerlockchange', () => {

  if (cameraParameters.activateFPC) {

    console.log('switch to first person controls')

    // deactivate OrbitControlsww
    cameraParameters.FPCenabled = true
    cameraParameters.activateFPC = false

    // rotate plane to be consistent with y-up pointerLockControls
    gsap.to(scene.rotation, { 

      duration: 4.5,  
      ease: 'power1', 
      delay: 0, 
      x: - Math.PI / 2,
      y: 0,
      z: 0

      , onComplete: () => {

        
        if (modelConfig.experiment != "Dune") jetStream.renderOrder = 4

        // if (modelConfig.experiment == "WoT") {
          
        //     jetStream.renderOrder = 3
        //     //clouds.renderOrder = 1

        // }
        
      }}) 

      cameraParameters.updateOnZoom = false

      if (modelConfig.timeRange == "541-0Ma") {

        gsap.to(shaderUniforms.uTreeSize, { duration: 4.5, ease: 'power1', value: 0.2 } )
        gsap.to(shaderUniforms.uUserTreeScale, { duration: 4.5, ease: 'power1', value: 10.0 } )
      
      }


  } else {

    console.log('switch to orbit controls')

    cameraParameters.FPCenabled = false

    gsap.to(scene.rotation, { 

      duration: 4.5,  
      ease: 'power1', 
      delay: 0, 
      x: 0,
      y: 0,
      z: 0

    })

    gsap.to(camera.position, {
  
      duration: 4.5,  
      x: 0,
      y: 0,
      z: 13.5,

  } );

  if (modelConfig.experiment != "Dune") {

    if (modelConfig.timeRange == "541-0Ma") {

      gsap.to(shaderUniforms.uTreeSize, { duration: 4.5, ease: 'power1', value: 2.0, onComplete: () => {

        cameraParameters.updateOnZoom = true
      
      }})

      gsap.to(shaderUniforms.uUserTreeScale, { duration: 4.5, ease: 'power1', value: 1.0 } )

    }

    jetStream.renderOrder = 5

    if (modelConfig.experiment == "WoT") {
        
      winds.renderOrder = 3
      //clouds.renderOrder = 1

    }

  }

    //setupKeyboardControls(surface, precipitation, clouds, ocean, vegGroup, oceanCurrents, winds)

  }
  
});

	controls.addEventListener('update', function (event) {

    const lerp = (x, y, a) => x * (1 - a) + y * a;
    const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
    const invlerp = (x, y, a) => clamp((a - x) / (y - x));

    //var zoom = controls.target.distanceTo( controls.object.position )
    var zoom = controls.distance

    var zoomWeight = invlerp(12.,3.,zoom)
    //var zoomWeight = 1.
    shaderUniforms.uZoomWeight.value = zoomWeight

    // update tree count and size based on new zoom level

    if (cameraParameters.updateOnZoom) {

      shaderUniforms.uTreeSize.value   = (shaderUniforms.uMaxTreeSize.value - 
                                          shaderUniforms.uZoomWeight.value * ( 1. *  (shaderUniforms.uMaxTreeSize.value - shaderUniforms.uMinTreeSize.value) ) );

      shaderUniforms.uTreeCount.value = (shaderUniforms.uMinTreeCount.value + 
                                          shaderUniforms.uZoomWeight.value * ( 0.09 *  (shaderUniforms.uMaxTreeCount.value - shaderUniforms.uMinTreeCount.value) ) );
      }
  

    // if (cameraParameters.updateOnZoom) {

    //   shaderUniforms.uTreeSize.value = lerp(shaderUniforms.uMaxTreeSize.value, shaderUniforms.uMinTreeSize.value, zoomWeight );
      
    // }

    // shaderUniforms.uTreeCount.value = lerp(shaderUniforms.uMinTreeCount.value, shaderUniforms.uMaxTreeCount.value * shaderUniforms.uUserTreeScale.value, zoomWeight );
    // shaderUniforms.uOceanParticleCount.value = lerp(shaderUniforms.uOceanMinParticleCount.value * shaderUniforms.uUserOceanParticleScale.value / 4., shaderUniforms.uOceanMaxParticleCount.value * shaderUniforms.uUserOceanParticleScale.value / 2., zoomWeight );
    // shaderUniforms.uOceanArrowSize.value = lerp(shaderUniforms.uOceanMaxArrowSize.value, shaderUniforms.uOceanMinArrowSize.value, zoomWeight );


    }

  )

  var timeline = document.getElementById("geologicTimescale");

  if (timeline) {

    timeline.addEventListener("click", function() {

        console.log('click')
    
        timeControl.hoverMode = false

        var timeout = setTimeout(function(){timeControl.hoverMode = true},2000);
  
      });

    }

}

function setupKeyboardControls(surface, precipitation, clouds, ocean, vegGroup, oceanCurrents, winds) {
  document.onkeydown = function(e) {

    switch (e.key) {

      case '0':
        surface.material.wireframe = !surface.material.wireframe
        precipitation.material.wireframe = !precipitation.material.wireframe
        if (clouds != null){
          clouds.material.wireframe = !clouds.material.wireframe
        }
        if (ocean != null){
          ocean.material.wireframe = !ocean.material.wireframe
        }
        if (oceanCurrents != null){
          oceanCurrents.material.wireframe = !oceanCurrents.material.wireframe
        }
        if (winds != null){
          winds.material.wireframe = !winds.material.wireframe
        }
        if (vegGroup != null){
          for (const object of vegGroup) {
            object.material.wireframe = !object.material.wireframe
          }
        }
      break;


      case ',':
        eventFire(document.getElementById('playBackward-button'), 'click')
      break
      case '.':
        eventFire(document.getElementById('playForward-button'), 'click')
      break
      case '/':
        eventFire(document.getElementById('playPause-button'), 'click')
      break
    }
  };
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


function setupKeyboardControlsFirstPerson(controls) {

  document.onkeydown = function(e) {
    switch (e.key) {
      case 'w':
        controls.moveForward(0.25)
        break
    case 'a':
        controls.moveRight(-0.25)
        break
    case 's':
        controls.moveForward(-0.25)
        break
    case 'd':
        controls.moveRight(0.25)
        break
    }
  };

}

export { initListeners, setupKeyboardControls, setupKeyboardControlsFirstPerson };
