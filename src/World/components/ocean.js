import { TextureLoader, ImageLoader, PlaneBufferGeometry, ShaderMaterial, FrontSide, BackSide, DoubleSide, Mesh, RepeatWrapping  } from 'three';
import oceanFieldVertexShader from '../../shaders/oceanField.vert'
import oceanFieldFragmentShader from '../../shaders/oceanField.frag'
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { cmapID, timeControl } from '../systems/initialModelConfig.js'
import gsap from 'gsap'

async function createOcean(modelConfig, baseDataImage, overlayDataImage, surfaceHeightImage, shaderUniforms ) {
  const loader = new TextureLoader();
  
  // Load all required data and textures async and only continue if all are available
  const [colorMapBase, iceTexture] = await Promise.all([
    loader.loadAsync('/colormaps/cmapHaxby.png'),
    loader.loadAsync('/textures/ice_bluemarble_seamless.jpg')
  ]);

  const thisBaseFrame = textureFromCanvas(baseDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextBaseFrame = textureFromCanvas(baseDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const thisOverlayFrame = textureFromCanvas(overlayDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextOverlayFrame = textureFromCanvas(overlayDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  iceTexture.wrapS = RepeatWrapping
  iceTexture.wrapT = RepeatWrapping

  const geometry = new PlaneBufferGeometry(4, 2, 96, 73);
//  const geometry = new PlaneBufferGeometry(4, 2, 64, 64);
  const material = new ShaderMaterial( {
    vertexShader: oceanFieldVertexShader,
    fragmentShader: oceanFieldFragmentShader,
    depthWrite: true,
    wireframe: false,
    transparent: true,
    side: FrontSide,
    uniforms: {
        uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
        uFrameWeight: shaderUniforms.uFrameWeight,
        uHeightDisplacement: shaderUniforms.uHeightDisplacement,
        uHeightGridXOffset: shaderUniforms.uHeightGridXOffset,
        uOpacityOcean: shaderUniforms.uOpacityOcean,
        uOpacityOceanBase: shaderUniforms.uOpacityOceanBase,
        uOpacityOceanOverlay: shaderUniforms.uOpacityOceanOverlay,
        uDepthOcean: shaderUniforms.uDepthOcean,
        uTransparentSeaIce: shaderUniforms.uTransparentSeaIce,
        uOceanBaseMinValue: shaderUniforms.uOceanBaseMinValue,
        uOceanBaseMaxValue: shaderUniforms.uOceanBaseMaxValue,
        uOceanOverlayMinValue: shaderUniforms.uOceanOverlayMinValue,
        uOceanOverlayMaxValue: shaderUniforms.uOceanOverlayMaxValue,
        uDarkerOcean: shaderUniforms.uDarkerOcean,
        thisBaseFrame : {value: thisBaseFrame },
        nextBaseFrame : {value: nextBaseFrame },
        thisOverlayFrame : {value: thisOverlayFrame },
        nextOverlayFrame : {value: nextOverlayFrame },
        thisHeightFrame : {value: thisHeightFrame },
        nextHeightFrame : {value: nextHeightFrame },
        colorMapBase : {value: colorMapBase },
        iceTexture : {value: iceTexture },
    },
} );

  const ocean = new Mesh( geometry, material );

  // define function to update texture if keyFrame changes
  ocean.tick = (frame, direction) => { 

    if(direction == 'backInTime') {

      ocean.material.uniforms.nextBaseFrame.value = ocean.material.uniforms.thisBaseFrame.value
      const thisBaseFrame = textureFromCanvas(baseDataImage, cmapID.fillMethod, frame)
      ocean.material.uniforms.thisBaseFrame.value = thisBaseFrame

      ocean.material.uniforms.nextOverlayFrame.value = ocean.material.uniforms.thisOverlayFrame.value
      const thisOverlayFrame = textureFromCanvas(overlayDataImage, cmapID.fillMethod, frame)
      ocean.material.uniforms.thisOverlayFrame.value = thisOverlayFrame

      ocean.material.uniforms.nextHeightFrame.value = ocean.material.uniforms.thisHeightFrame.value
      const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame)
      ocean.material.uniforms.thisHeightFrame.value = thisHeightFrame

    } else if(direction == 'forwardInTime') {


      ocean.material.uniforms.thisBaseFrame.value = ocean.material.uniforms.nextBaseFrame.value
      const nextBaseFrame = textureFromCanvas(baseDataImage, cmapID.fillMethod, frame + 1)
      ocean.material.uniforms.nextBaseFrame.value = nextBaseFrame

      ocean.material.uniforms.thisOverlayFrame.value = ocean.material.uniforms.nextOverlayFrame.value
      const nextOverlayFrame = textureFromCanvas(overlayDataImage, cmapID.fillMethod, frame + 1)
      ocean.material.uniforms.nextOverlayFrame.value = nextOverlayFrame

      ocean.material.uniforms.thisHeightFrame.value = ocean.material.uniforms.nextHeightFrame.value
      const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame + 1)
      ocean.material.uniforms.nextHeightFrame.value = nextHeightFrame

    }
  }

  // define function to change texture filtering
  ocean.changeFilter = (frame, oldFilter, newFilter) => { 
    
    ocean.material.uniforms.thisBaseFrame.value = textureFromCanvas(baseDataImage, oldFilter, frame)
    ocean.material.uniforms.nextBaseFrame.value = textureFromCanvas(baseDataImage, newFilter, frame)

    ocean.material.uniforms.thisOverlayFrame.value = textureFromCanvas(overlayDataImage, oldFilter, frame)
    ocean.material.uniforms.nextOverlayFrame.value = textureFromCanvas(overlayDataImage, newFilter, frame)

    ocean.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, oldFilter, frame)
    ocean.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, newFilter, frame)

 //   surface.material.uniforms.uFrameWeight.value = 0.0

  }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    ocean.resetTextures = async (frame, filter) => { 
    
      ocean.material.uniforms.thisBaseFrame.value = textureFromCanvas(baseDataImage, filter, frame)
      ocean.material.uniforms.thisOverlayFrame.value = textureFromCanvas(overlayDataImage, filter, frame)
      ocean.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

  //    surface.material.uniforms.uFrameWeight.value = 1.0
  
    }

    ocean.slideIn = (duration) => { 
    
      shaderUniforms.uOpacityOcean.value = 0.0
      shaderUniforms.uDepthOcean.value = 0.2
      gsap.to(shaderUniforms.uDepthOcean, { duration: duration, ease: 'none', value: 0.0 } )
 
    }

    const imageLoader = new ImageLoader()

    ocean.changeHeightData = async (frame, filter, heightData) => { 
    
      ocean.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

      console.log('change ocean')

      let uNewHeightGridXOffset
      if (heightData === 'Valdes et al. (2021)') {

        uNewHeightGridXOffset = 0.00725
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_height.' + modelConfig.timeRange + '.png')

        //gsap.to(ocean.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffset })

      } else if (heightData === 'Scotese & Wright (1.0 deg)') {

        uNewHeightGridXOffset = -0.00139
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.png')

        gsap.to(ocean.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffset })

      }  else if (heightData === 'Scotese & Wright (0.25 deg)') {

        uNewHeightGridXOffset = -0.00035
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.025.png')

        gsap.to(ocean.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffset })

      }  


      ocean.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)
      ocean.material.uniforms.nextBaseFrame.value = ocean.material.uniforms.thisBaseFrame.value
      ocean.material.uniforms.nextOverlayFrame.value = ocean.material.uniforms.thisOverlayFrame.value

    }

  return ocean;
}

export { createOcean };
