import { TextureLoader, ImageLoader, PlaneBufferGeometry, ShaderMaterial, FrontSide, BackSide, DoubleSide, Mesh  } from 'three';
import precipitationVertexShader from '../../shaders/precipitation.vert'
import precipitationFragmentShader from '../../shaders/precipitation.frag'
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { cmapID, timeControl } from '../systems/initialModelConfig.js'
import { createColormapTexture } from '../systems/colormapTexture.js'

async function createPrecipitation(prDataImage, config, shaderUniforms, timeControl ) {
  const loader = new TextureLoader();
  
  // Load all required data and textures async and only continue if all are available
  var colorMapPrecipitation
  var CMIP6Mode 
  var numLon 
  var numLat 

  if (config.project == "CMIP6") {

    colorMapPrecipitation = await loader.loadAsync('/colormaps/ipccPrecip.png')
    CMIP6Mode = true
    numLon = 180.
    numLat = 90.

  } else if (config.experiment == "Dune") {

    colorMapPrecipitation = createColormapTexture('YlGnBu-9')
    CMIP6Mode = false
    // low-res
    numLon = 96.
    numLat = 73.
    // high-res
    //numLon = 432.
    //numLat = 323.

  } else if (config.experiment == "WoT") {

    colorMapPrecipitation = createColormapTexture('YlGnBu-9')
    CMIP6Mode = false
    // low-res
    numLon = 128.
    numLat = 64.

  } else {

    colorMapPrecipitation = createColormapTexture('YlGnBu-9')

    CMIP6Mode = false
    numLon = 96.
    numLat = 73.
  }

  const thisPrecipitationFrame = textureFromCanvas(prDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextPrecipitationFrame = textureFromCanvas(prDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const geometry = new PlaneBufferGeometry(4, 2, 64, 64);
//  const geometry = new PlaneBufferGeometry(4, 2, 64, 64);
  const material = new ShaderMaterial( {
    vertexShader: precipitationVertexShader,
    fragmentShader: precipitationFragmentShader,
    wireframe: false,
    transparent: true,
    side: DoubleSide,
    uniforms: {
        uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
        uFrameWeight: shaderUniforms.uFrameWeight,
        uHeightDisplacement: shaderUniforms.uHeightDisplacement,
        uOpacityPrecipitation: shaderUniforms.uOpacityPrecipitation,
        uHeightPrecipitation: shaderUniforms.uHeightPrecipitation,
        uPrecipitationMinValue: shaderUniforms.uPrecipitationMinValue,
        uPrecipitationMaxValue: shaderUniforms.uPrecipitationMaxValue,
        thisPrecipitationFrame : {value: thisPrecipitationFrame },
        nextPrecipitationFrame : {value: nextPrecipitationFrame },
        colorMapPrecipitation : {value: colorMapPrecipitation },
        uCMIP6Mode: {value: CMIP6Mode},
        numLon: {value: numLon},
        numLat: {value: numLat},

    },
} );

  const precipitation = new Mesh( geometry, material );

  // define function to update texture if keyFrame changes
  precipitation.tick = (frame, direction) => { 


    if(direction == 'backInTime') {

      precipitation.material.uniforms.nextPrecipitationFrame.value = precipitation.material.uniforms.thisPrecipitationFrame.value
      const thisPrecipitationFrame = textureFromCanvas(prDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
      precipitation.material.uniforms.thisPrecipitationFrame.value = thisPrecipitationFrame


    } else if(direction == 'forwardInTime') {

      //console.log('forward in time to: '+ timeControl.nextTimeFrame)

      precipitation.material.uniforms.thisPrecipitationFrame.value = precipitation.material.uniforms.nextPrecipitationFrame.value
      const nextPrecipitationFrame = textureFromCanvas(prDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)
      precipitation.material.uniforms.nextPrecipitationFrame.value = nextPrecipitationFrame

    }
  }

  // define function to change texture filtering
  precipitation.changeFilter = (frame, oldFilter, newFilter) => { 
    
    precipitation.material.uniforms.thisPrecipitationFrame.value = textureFromCanvas(prDataImage, oldFilter, timeControl.currentTimeFrame)
    precipitation.material.uniforms.nextPrecipitationFrame.value = textureFromCanvas(prDataImage, newFilter, timeControl.currentTimeFrame)


  }

  precipitation.changeHeightData = async (frame, filter) => { 

    precipitation.material.uniforms.nextPrecipitationFrame.value = precipitation.material.uniforms.thisPrecipitationFrame.value

  }


    // define function to reset textures to rounded frame number after GSAP transition is complete
    precipitation.resetTextures = (frame, filter) => { 
    
      precipitation.material.uniforms.thisPrecipitationFrame.value = textureFromCanvas(prDataImage, filter, timeControl.currentTimeFrame)
  
    }

  return precipitation;
}

export { createPrecipitation };
