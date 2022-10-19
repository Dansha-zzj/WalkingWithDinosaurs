import { LinearFilter, RepeatWrapping, TextureLoader, ImageLoader, PlaneBufferGeometry, ShaderMaterial, FrontSide, BackSide, DoubleSide, Mesh  } from 'three';
import cloudsVertexShader from '../../shaders/clouds.vert'
import cloudsFragmentShader from '../../shaders/clouds.frag'
import cloudsFragmentShaderWoT from '../../shaders/cloudsWoT.frag'
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { cmapID, timeControl } from '../systems/initialModelConfig.js'

async function createClouds(cloudsDataImage, config, shaderUniforms, timeControl ) {
  const loader = new TextureLoader();
  
  // Load all required data and textures async and only continue if all are available

  const cloudsTexture = await loader.loadAsync('/textures/clouds_bluemarble_seamless.jpg')
  cloudsTexture.magFilter = LinearFilter
  cloudsTexture.minFilter = LinearFilter
  cloudsTexture.generateMipmaps = false; 
  cloudsTexture.wrapS = cloudsTexture.wrapT = RepeatWrapping

  const thisCloudsFrame = textureFromCanvas(cloudsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextCloudsFrame = textureFromCanvas(cloudsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const geometry = new PlaneBufferGeometry(4, 2, 64, 64);

  const material = new ShaderMaterial( {
    vertexShader: cloudsVertexShader,
    fragmentShader: ( config.experiment === "WoT") ? cloudsFragmentShaderWoT : cloudsFragmentShader,
    wireframe: false,
    transparent: true,
    side: FrontSide,
    uniforms: {
        uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
        uFrameWeight: shaderUniforms.uFrameWeight,
        uHeightDisplacement: shaderUniforms.uHeightDisplacement,
        uOpacityClouds: shaderUniforms.uOpacityClouds,
        uHeightClouds: shaderUniforms.uHeightClouds,
        uCloudsMinValue: shaderUniforms.uCloudsMinValue,
        uCloudsMaxValue: shaderUniforms.uCloudsMaxValue,
        thisCloudsFrame : {value: thisCloudsFrame },
        nextCloudsFrame : {value: nextCloudsFrame },
        cloudsTexture : {value: cloudsTexture },

    },
} );

  const clouds = new Mesh( geometry, material );

  // define function to update texture if keyFrame changes
  clouds.tick = (frame, direction) => { 


    if(direction == 'backInTime') {

      clouds.material.uniforms.nextCloudsFrame.value = clouds.material.uniforms.thisCloudsFrame.value
      const thisCloudsFrame = textureFromCanvas(cloudsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
      clouds.material.uniforms.thisCloudsFrame.value = thisCloudsFrame


    } else if(direction == 'forwardInTime') {

      clouds.material.uniforms.thisCloudsFrame.value = clouds.material.uniforms.nextCloudsFrame.value
      const nextCloudsFrame = textureFromCanvas(cloudsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)
      clouds.material.uniforms.nextCloudsFrame.value = nextCloudsFrame

    }
  }

  // define function to change texture filtering
  clouds.changeFilter = (frame, oldFilter, newFilter) => { 
    
    clouds.material.uniforms.thisCloudsFrame.value = textureFromCanvas(cloudsDataImage, oldFilter, timeControl.currentTimeFrame)
    clouds.material.uniforms.nextCloudsFrame.value = textureFromCanvas(cloudsDataImage, newFilter, timeControl.currentTimeFrame)


  }

  clouds.changeHeightData = async (frame, filter) => { 

    clouds.material.uniforms.nextCloudsFrame.value = clouds.material.uniforms.thisCloudsFrame.value

  }


    // define function to reset textures to rounded frame number after GSAP transition is complete
    clouds.resetTextures = (frame, filter) => { 
    
      clouds.material.uniforms.thisCloudsFrame.value = textureFromCanvas(cloudsDataImage, filter, timeControl.currentTimeFrame)
  
    }

  return clouds;
}

export { createClouds };
