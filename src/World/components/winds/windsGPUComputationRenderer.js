import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { oceanCurrentParameters, cmapID, timeControl } from '../../systems/initialModelConfig.js'
import windsComputeShaderPosition from '../../../shaders/windsComputeShaderPosition.frag' 
import windsComputeShaderPositionDune from '../../../shaders/windsComputeShaderPositionDune.frag' 
import windsComputeShaderPositionWoT from '../../../shaders/windsComputeShaderPositionWoT.frag' 
import { HalfFloatType, TextureLoader, RepeatWrapping, LinearFilter, RGBFormat } from 'three';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'
import { loadTexture2Uniform } from '../../systems/texture2Uniform.js'


async function initComputeRendererWinds(windsInitialPositions, renderer, winds, windsDataImage, modelConfig, shaderUniforms, timeControl, height) {

    let gpuComputeWinds = new GPUComputationRenderer( Math.sqrt(shaderUniforms.uWindsMaxParticleCount.value ), Math.sqrt(shaderUniforms.uWindsMaxParticleCount.value ), renderer );

    let dtPosition = gpuComputeWinds.createTexture();
  
    fillTexture( dtPosition, windsInitialPositions );

    let positionVariable, thisHeightFrame, duneHeightFrame

    if (modelConfig.experiment === "Dune") {

      thisHeightFrame = await loadTexture2Uniform('/modelData/BRIDGE/tfgzk/tfgzk_height.smoothed.png'),
      duneHeightFrame = await loadTexture2Uniform('/modelData/BRIDGE/tfgzk/tfgzk_duneHeight.ym.png'),

      positionVariable = gpuComputeWinds.addVariable( "texturePosition", windsComputeShaderPositionDune, dtPosition );


    } else if (modelConfig.experiment === "WoT") {

      thisHeightFrame = await loadTexture2Uniform('/modelData/BRIDGE/wot1/wot1_map.png'),

      positionVariable = gpuComputeWinds.addVariable( "texturePosition", windsComputeShaderPositionWoT, dtPosition );

    }
    
    else {

      positionVariable = gpuComputeWinds.addVariable( "texturePosition", windsComputeShaderPosition, dtPosition );
      
    }


    gpuComputeWinds.setVariableDependencies( positionVariable, [ positionVariable ] );

    let positionUniforms = positionVariable.material.uniforms;

    let windsThisDataFrame, windsNextDataFrame
  
    windsThisDataFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
    windsNextDataFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

    positionUniforms[ "windsThisDataFrame" ] = { value: windsThisDataFrame };
    positionUniforms[ "windsNextDataFrame" ] = { value: windsNextDataFrame };
    positionUniforms[ "thisHeightFrame" ] = { value: thisHeightFrame };
    positionUniforms[ "duneHeightFrame" ] = { value: duneHeightFrame };
    positionUniforms[ "uFrameWeight" ] = shaderUniforms.uFrameWeight
    positionUniforms[ "uDelta" ] = { value: null}

    if (height == "surface") {

      positionUniforms[ "uSpeed" ] = shaderUniforms.uWindsParticleSpeed
      positionUniforms[ "uSpeedMax" ] = shaderUniforms.uWindsSpeedMax
      positionUniforms[ "uRandSeed" ] = shaderUniforms.uRandSeed
      positionUniforms[ "uWindsParticleLifeTime" ] = {value: shaderUniforms.uWindsParticleLifeTime.value }
      positionUniforms[ "uSphereWrapAmount" ] = shaderUniforms.uSphereWrapAmount
      positionUniforms[ "uHeightWinds" ] = shaderUniforms.uHeightWinds
      positionUniforms[ "uWindsSpeedMin" ] = shaderUniforms.uWindsSpeedMin
      positionUniforms[ "uHeightDisplacement" ] = shaderUniforms.uHeightDisplacement
      positionUniforms[ "uHeightDisplacementDunes" ] = shaderUniforms.uHeightDisplacementDunes
      positionUniforms[ "uMinDuneHeight" ] = shaderUniforms.uMinDuneHeight
      positionUniforms[ "uOpacityDunes" ] = shaderUniforms.uOpacityDunes
      positionUniforms[ "uWindsZonalDataMin" ] = shaderUniforms.uWindsZonalDataMin
      positionUniforms[ "uWindsZonalDataMax" ] = shaderUniforms.uWindsZonalDataMax
      positionUniforms[ "uWindsMeridionalDataMin" ] = shaderUniforms.uWindsMeridionalDataMin
      positionUniforms[ "uWindsMeridionalDataMax" ] = shaderUniforms.uWindsMeridionalDataMax
      positionUniforms[ "uWindsTopographyInfluence" ] = shaderUniforms.uWindsTopographyInfluence

    } else if (height == "jetStream") {

      positionUniforms[ "uSpeed" ] = shaderUniforms.uJetStreamParticleSpeed
      positionUniforms[ "uSpeedMax" ] = shaderUniforms.uJetStreamSpeedMax
      positionUniforms[ "uRandSeed" ] = shaderUniforms.uRandSeed
      positionUniforms[ "uWindsParticleLifeTime" ] = {value: shaderUniforms.uJetStreamParticleLifeTime.value }
      positionUniforms[ "uSphereWrapAmount" ] = shaderUniforms.uSphereWrapAmount
      positionUniforms[ "uHeightJinds" ] = shaderUniforms.uHeightJetStream
      positionUniforms[ "uindsSpeedMin" ] = shaderUniforms.uJetStreamSpeedMin
      positionUniforms[ "uHeightDisplacement" ] = shaderUniforms.uHeightDisplacement
      positionUniforms[ "uHeightDisplacementDunes" ] = shaderUniforms.uHeightDisplacementDunes
      positionUniforms[ "uMinDuneHeight" ] = shaderUniforms.uMinDuneHeight
      positionUniforms[ "uOpacityDunes" ] = shaderUniforms.uOpacityDunes
      positionUniforms[ "uWindsZonalDataMin" ] = shaderUniforms.uJetStreamZonalDataMin
      positionUniforms[ "uWindsZonalDataMax" ] = shaderUniforms.uJetStreamZonalDataMax
      positionUniforms[ "uWindsMeridionalDataMin" ] = shaderUniforms.uJetStreamMeridionalDataMin
      positionUniforms[ "uWindsMeridionalDataMax" ] = shaderUniforms.uJetStreamMeridionalDataMax
      positionUniforms[ "uWindsTopographyInfluence" ] = shaderUniforms.uJetStreamTopographyInfluence

    }

    //uWindsSpeedMin: shaderUniforms.uWindsSpeedMin,

    gpuComputeWinds.tickEachFrame = (currentTime, cameraParameters, deltaTime) => { 

      gpuComputeWinds.variables[0].material.uniforms.uDelta.value = deltaTime
      gpuComputeWinds.variables[0].material.uniforms.uRandSeed.value = Math.random()

      gpuComputeWinds.compute();

      winds.material.uniforms[ "texturePosition" ].value = gpuComputeWinds.getCurrentRenderTarget( positionVariable ).texture;

    }

    gpuComputeWinds.tick = (frame, direction) => { 

      if(direction == 'backInTime') {
   
        gpuComputeWinds.variables[0].material.uniforms.windsNextDataFrame.value = gpuComputeWinds.variables[0].material.uniforms.windsThisDataFrame.value
         const thisDataFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
         gpuComputeWinds.variables[0].material.uniforms.windsThisDataFrame.value = thisDataFrame
   
       } else if(direction == 'forwardInTime') {
   
         gpuComputeWinds.variables[0].material.uniforms.windsThisDataFrame.value = gpuComputeWinds.variables[0].material.uniforms.windsNextDataFrame.value
         const nextDataFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)
         gpuComputeWinds.variables[0].material.uniforms.windsNextDataFrame.value = nextDataFrame
   
       }
     }

      // define function to change texture filtering
      gpuComputeWinds.changeFilter = (frame, oldFilter, newFilter) => { 



  }

  gpuComputeWinds.changeHeightData = async (frame, filter) => { 
    
    gpuComputeWinds.variables[0].material.uniforms.windsNextDataFrame.value = gpuComputeWinds.variables[0].material.uniforms.windsThisDataFrame.value

  }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    gpuComputeWinds.resetTextures = (frame, filter) => { 
    
      gpuComputeWinds.variables[0].material.uniforms.windsThisDataFrame.value = textureFromCanvas(windsDataImage, filter, timeControl.currentTimeFrame)

    } 

    const error = gpuComputeWinds.init();

    if ( error !== null ) {

      console.error( error );

    } else {

      return gpuComputeWinds ;

    }


  }

  function isSafari() {

    return !! navigator.userAgent.match( /Safari/i ) && ! navigator.userAgent.match( /Chrome/i );

  }

function fillTexture( texturePosition, initialPositions ) {

  let posArray = texturePosition.image.data;

  for ( let k = 0, kl = posArray.length; k < kl; k += 4 ) {

    // Fill in texture values
    posArray[ k + 0 ] = initialPositions.posArray[k + 0]
    posArray[ k + 1 ] = initialPositions.posArray[k + 1]
    posArray[ k + 2 ] = initialPositions.posArray[k + 2]
    posArray[ k + 3 ] = initialPositions.posArray[k + 3]

  }

}
  
  export { initComputeRendererWinds };