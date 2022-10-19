import { Mesh } from 'three';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'
import { cmapID } from '../../systems/initialModelConfig.js'
import { createWindsGeometry } from './windsGeometry.js'
import { createWindsMaterial } from './windsMaterial.js'

async function createWinds(initialPositions, windsDataImage, shaderUniforms, timeControl, modelConfig, height) {

    const [ geometry, quaternionTexture ]  = await createWindsGeometry(initialPositions, shaderUniforms, height)

    const material = await createWindsMaterial(windsDataImage, quaternionTexture, shaderUniforms, height)

    const winds = new Mesh( geometry, material.material )

    winds.geometry.scale(0.016, 0.016, 0.016)
    winds.frustumCulled = false; // disable frustum culling

    // method to dynamically update number of arrows each frame
    winds.tickEachFrame = () => { 

        if (height == "surface") {

            winds.geometry.instanceCount = ( shaderUniforms.uWindsMinParticleCount.value + shaderUniforms.uZoomWeight.value * ( 0.8 * shaderUniforms.uWindsMaxParticleCount.value - shaderUniforms.uWindsMinParticleCount.value) ) * shaderUniforms.uUserWindsParticleScale.value
            shaderUniforms.uWindsArrowSize.value = ( shaderUniforms.uWindsMaxArrowSize.value - shaderUniforms.uZoomWeight.value * ( shaderUniforms.uWindsMaxArrowSize.value - shaderUniforms.uWindsMinArrowSize.value) ) * shaderUniforms.uUserWindsParticleSizeScale.value * ( 0.8 + 0.2 * shaderUniforms.uSphereWrapAmount.value )
    
        } else if (height == "jetStream") {

            winds.geometry.instanceCount = shaderUniforms.uJetStreamParticleCount.value
            shaderUniforms.uJetStreamArrowSize.value =  shaderUniforms.uJetStreamArrowSizeState.value - 0.3 * ( ( 1. - shaderUniforms.uSphereWrapAmount.value ) * shaderUniforms.uJetStreamArrowSizeState.value  )

        }
 

    }


    // define function to update texture if keyFrame changes
    winds.tick = (frame, direction) => { 

        if(direction == 'backInTime') {

        winds.material.uniforms.nextWindsFrame.value = winds.material.uniforms.thisWindsFrame.value
        const thisWindsFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
        winds.material.uniforms.thisWindsFrame.value = thisWindsFrame

        } else if(direction == 'forwardInTime') {

        winds.material.uniforms.thisWindsFrame.value = winds.material.uniforms.nextWindsFrame.value
        const nextWindsFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)
        winds.material.uniforms.nextWindsFrame.value = nextWindsFrame

        }
    }

    // define function to change texture filtering
    winds.changeFilter = (frame, oldFilter, newFilter) => { 

        winds.material.uniforms.thisWindsFrame.value = textureFromCanvas(windsDataImage, oldFilter, timeControl.currentTimeFrame)
        winds.material.uniforms.nextWindsFrame.value = textureFromCanvas(windsDataImage, newFilter, timeControl.currentTimeFrame)

    }


    winds.changeHeightData = async () => { 
    
        winds.material.uniforms.nextWindsFrame.value = winds.material.uniforms.thisWindsFrame.value
  
      }

        // define function to reset textures to rounded frame number after GSAP transition is complete
    winds.resetTextures = (frame, filter) => { 
        
        winds.material.uniforms.thisWindsFrame.value = textureFromCanvas(windsDataImage, filter, frame)
    
        }

  return winds
  
}

export { createWinds };
