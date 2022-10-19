import { Mesh } from 'three';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'
import { cmapID } from '../../systems/initialModelConfig.js'
import { createOceanCurrentsGeometry } from './oceanCurrentsGeometry.js'
import { createOceanCurrentsMaterial } from './oceanCurrentsMaterial.js'

import { timeControl } from '../../systems/initialModelConfig.js'

async function createOceanCurrents(initialPositions, currentsDataImage, shaderUniforms) {

    const [ geometry, quaternionTexture ]  = await createOceanCurrentsGeometry(initialPositions, shaderUniforms)

    const material = await createOceanCurrentsMaterial(currentsDataImage, quaternionTexture, shaderUniforms)

    const oceanCurrents = new Mesh( geometry, material.material )

    oceanCurrents.geometry.scale(0.016, 0.016, 0.016)
    oceanCurrents.frustumCulled = false; // disable frustum culling

    // method to dynamically update number of trees at each frame
    oceanCurrents.tickEachFrame = (currentTime, cameraParameters, deltaTime) => { 

        // update number of arrows based on zoom and user selection

        oceanCurrents.geometry.instanceCount = ( shaderUniforms.uOceanMinParticleCount.value + shaderUniforms.uZoomWeight.value * ( 0.8 * shaderUniforms.uOceanMaxParticleCount.value - shaderUniforms.uOceanMinParticleCount.value) ) * shaderUniforms.uUserOceanParticleScale.value
        shaderUniforms.uOceanArrowSize.value = ( shaderUniforms.uOceanMaxArrowSize.value - shaderUniforms.uZoomWeight.value * ( shaderUniforms.uOceanMaxArrowSize.value - shaderUniforms.uOceanMinArrowSize.value) ) * shaderUniforms.uUserOceanParticleSizeScale.value * ( 0.8 + 0.2 * shaderUniforms.uSphereWrapAmount.value )

    }

    // define function to update texture if keyFrame changes
    oceanCurrents.tick = (frame, direction) => { 

        if(direction == 'backInTime') {

        oceanCurrents.material.uniforms.nextCurrentsFrame.value = oceanCurrents.material.uniforms.thisCurrentsFrame.value
        const thisCurrentsFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, frame)
        oceanCurrents.material.uniforms.thisCurrentsFrame.value = thisCurrentsFrame

        } else if(direction == 'forwardInTime') {

        oceanCurrents.material.uniforms.thisCurrentsFrame.value = oceanCurrents.material.uniforms.nextCurrentsFrame.value
        const nextCurrentsFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, frame + 1)
        oceanCurrents.material.uniforms.nextCurrentsFrame.value = nextCurrentsFrame

        }
    }

    // define function to change texture filtering
    oceanCurrents.changeFilter = (frame, oldFilter, newFilter) => { 

        oceanCurrents.material.uniforms.thisCurrentsFrame.value = textureFromCanvas(currentsDataImage, oldFilter, frame)
        oceanCurrents.material.uniforms.nextCurrentsFrame.value = textureFromCanvas(currentsDataImage, newFilter, frame)

    }


    oceanCurrents.changeHeightData = async (frame, filter) => { 
    
        oceanCurrents.material.uniforms.nextCurrentsFrame.value = oceanCurrents.material.uniforms.thisCurrentsFrame.value
  
      }

        // define function to reset textures to rounded frame number after GSAP transition is complete
    oceanCurrents.resetTextures = (frame, filter) => { 
        
        oceanCurrents.material.uniforms.thisCurrentsFrame.value = textureFromCanvas(currentsDataImage, filter, frame)
    
        }

  return oceanCurrents
  
}

export { createOceanCurrents };
