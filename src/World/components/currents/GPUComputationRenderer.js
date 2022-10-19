import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import { oceanCurrentParameters, cmapID, timeControl } from '../../systems/initialModelConfig.js'
import oceanComputeShaderPosition from '../../../shaders/oceanComputeShaderPosition.frag' 
import { HalfFloatType, TextureLoader, RepeatWrapping, LinearFilter, RGBFormat } from 'three';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'


async function initComputeRenderer(initialPositionsOcean, renderer, oceanCurrents, currentsDataImage, surfaceHeightImage, modelID, shaderUniforms) {

    let gpuCompute = new GPUComputationRenderer( Math.sqrt(shaderUniforms.uOceanMaxParticleCount.value * 4.), Math.sqrt(shaderUniforms.uOceanMaxParticleCount.value * 4.), renderer );

    let dtPosition = gpuCompute.createTexture();
  
    fillTexture( dtPosition, initialPositionsOcean );

    let positionVariable = gpuCompute.addVariable( "texturePosition", oceanComputeShaderPosition, dtPosition );

    gpuCompute.setVariableDependencies( positionVariable, [ positionVariable ] );

    let positionUniforms = positionVariable.material.uniforms;

    let oceanCurrentsThisDataFrame, oceanCurrentsNextDataFrame
  
    if (oceanCurrentParameters.enable3D === false) {

      oceanCurrentsThisDataFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
      oceanCurrentsNextDataFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

    } else {

      const textureLoader = new TextureLoader()
        
      // load 3D ocean velocities
      oceanCurrentsThisDataFrame = await textureLoader.loadAsync('/modelData/' + modelID.project + '/' + modelID.name + '/timeslices/teyea_oceanCurrents.3D.ym.png')
      oceanCurrentsNextDataFrame = await textureLoader.loadAsync('/modelData/' + modelID.project + '/' + modelID.name + '/timeslices/teyea_oceanCurrents.3D.ym.png')

      oceanCurrentsThisDataFrame.wrapS = oceanCurrentsThisDataFrame.wrapT = RepeatWrapping
      oceanCurrentsThisDataFrame.magFilter = LinearFilter
      oceanCurrentsThisDataFrame.minFilter = LinearFilter
      oceanCurrentsThisDataFrame.generateMipmaps = false; 
      oceanCurrentsThisDataFrame.format = RGBFormat

    }

    const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.currentTimeFrame)
    const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.nextTimeFrame)

    var uOceanDepthLevels = [
         5.0, 
        15.0, 
        25.0, 
        35.1, 
        47.8, 
        67.0, 
        95.8, 
       138.9, 
       203.7, 
       301.0, 
       447.0, 
       666.3, 
       995.5, 
      1500.8, 
      2116.1, 
      2731.4, 
      3346.8, 
      3962.1, 
      4577.4, 
      5192.6
    ]

    positionUniforms[ "oceanCurrentsThisDataFrame" ] = { value: oceanCurrentsThisDataFrame };
    positionUniforms[ "oceanCurrentsNextDataFrame" ] = { value: oceanCurrentsNextDataFrame };
    // positionUniforms[ "thisHeightFrame" ] = { value: thisHeightFrame };
    // positionUniforms[ "nextHeightFrame" ] = { value: nextHeightFrame };
    positionUniforms[ "uFrameWeight" ] = shaderUniforms.uFrameWeight
    positionUniforms[ "uDelta" ] = { value: null}
    positionUniforms[ "uSpeed" ] = shaderUniforms.uOceanParticleSpeed
    positionUniforms[ "uRandSeed" ] = shaderUniforms.uRandSeed
    positionUniforms[ "uDropRate" ] = shaderUniforms.uDropRate
    positionUniforms[ "uDropRateBump" ] = shaderUniforms.uDropRateBump
    positionUniforms[ "uSpeedMax" ] = shaderUniforms.uSpeedMax
    positionUniforms[ "uOceanEnable3D" ] = {value: oceanCurrentParameters.enable3D }
    positionUniforms[ "uHeightDisplacement" ] = shaderUniforms.uHeightDisplacement
    positionUniforms[ "uOceanDepthLevels" ] = { type: "fv1", value: uOceanDepthLevels }
    positionUniforms[ "uOceanParticleLifeTime" ] = {value: shaderUniforms.uOceanParticleLifeTime.value }
    positionUniforms[ "uSphereWrapAmount" ] = shaderUniforms.uSphereWrapAmount

    gpuCompute.tickEachFrame = (currentTime, cameraParameters, deltaTime) => { 

      gpuCompute.variables[0].material.uniforms.uDelta.value = deltaTime
      gpuCompute.variables[0].material.uniforms.uRandSeed.value = Math.random()

      gpuCompute.compute();

      oceanCurrents.material.uniforms[ "texturePosition" ].value = gpuCompute.getCurrentRenderTarget( positionVariable ).texture;

    }

    gpuCompute.tick = (frame, direction) => { 

      if(direction == 'backInTime') {
   
         gpuCompute.variables[0].material.uniforms.oceanCurrentsNextDataFrame.value = gpuCompute.variables[0].material.uniforms.oceanCurrentsThisDataFrame.value
         const thisDataFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, frame)
         gpuCompute.variables[0].material.uniforms.oceanCurrentsThisDataFrame.value = thisDataFrame
   
        //  gpuCompute.variables[0].material.uniforms.nextHeightFrame.value = gpuCompute.variables[0].material.uniforms.thisHeightFrame.value
        //  const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame)
        //  gpuCompute.variables[0].material.uniforms.thisHeightFrame.value = thisHeightFrame
   
       } else if(direction == 'forwardInTime') {
   
         gpuCompute.variables[0].material.uniforms.oceanCurrentsThisDataFrame.value = gpuCompute.variables[0].material.uniforms.oceanCurrentsNextDataFrame.value
         const nextDataFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, frame + 1)
         gpuCompute.variables[0].material.uniforms.oceanCurrentsNextDataFrame.value = nextDataFrame
   
        //  gpuCompute.variables[0].material.uniforms.thisHeightFrame.value = gpuCompute.variables[0].material.uniforms.nextHeightFrame.value
        //  const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame + 1)
        //  gpuCompute.variables[0].material.uniforms.nextHeightFrame.value = nextHeightFrame
   
       }
     }

      // define function to change texture filtering
    gpuCompute.changeFilter = (frame, oldFilter, newFilter) => { 



  }

  gpuCompute.changeHeightData = async (frame, filter) => { 
    
    gpuCompute.variables[0].material.uniforms.oceanCurrentsNextDataFrame.value = gpuCompute.variables[0].material.uniforms.oceanCurrentsThisDataFrame.value

  }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    gpuCompute.resetTextures = (frame, filter) => { 
    
      gpuCompute.variables[0].material.uniforms.oceanCurrentsThisDataFrame.value = textureFromCanvas(currentsDataImage, filter, frame)

    } 

    const error = gpuCompute.init();

    if ( error !== null ) {

      console.error( error );

    } else {

      return gpuCompute ;

    }


  }

  function isSafari() {

    return !! navigator.userAgent.match( /Safari/i ) && ! navigator.userAgent.match( /Chrome/i );

  }

function fillTexture( texturePosition, initialPositionsOcean ) {

  let posArray = texturePosition.image.data;

  for ( let k = 0, kl = posArray.length; k < kl; k += 4 ) {

    // Fill in texture values
    posArray[ k + 0 ] = initialPositionsOcean.posArray[k + 0]
    posArray[ k + 1 ] = initialPositionsOcean.posArray[k + 1]
    posArray[ k + 2 ] = initialPositionsOcean.posArray[k + 2]
    posArray[ k + 3 ] = initialPositionsOcean.posArray[k + 3]

  }

}
  
  export { initComputeRenderer };