import { ShaderMaterial, Color, DataTexture, RGBFormat, LinearFilter, TextureLoader, DoubleSide, BackSide, NoBlending} from 'three';
import { cmapID, timeControl } from '../../systems/initialModelConfig.js';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'
import vertexShader from '../../../shaders/winds.vert'
import fragmentShader from '../../../shaders/winds.frag'

async function createWindsMaterial(windsDataImage, quaternionTexture, shaderUniforms, layerHeight) {

    
    // load climate model data
    const thisWindsFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
    const nextWindsFrame = textureFromCanvas(windsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

    // Colormap for particles, from:
    // https://colorbrewer2.org/?type=diverging&scheme=Spectral&n=11

    var colors = [
        //    'rgb(158,1,66)',
            'rgb(213,62,79)',
            'rgb(244,109,67)',
            'rgb(253,174,97)',
            'rgb(254,224,139)',
        //     'rgb(255,255,191)',
            'rgb(230,245,152)',
            'rgb(171,221,164)',
            'rgb(102,194,165)',
            'rgb(50,136,189)',
        //    'rgb(94,79,162)'
            ]
        
            const width = colors.length;
            const height = 1;
            
            const size = width * height;
            const data = new Uint8Array( 3 * size );
        
            
            for ( let i = 0; i < size; i ++ ) {
        
                const rgb = new Color(colors[i])
            
                const stride = i * 3;
            
                data[ stride ] = rgb.r * 255;
                data[ stride + 1 ] = rgb.g * 255;
                data[ stride + 2 ] = rgb.b * 255;
            
            }
            
            // used the buffer to create a DataTexture
            
            const cmapTexture = new DataTexture( data, width, height, RGBFormat );
            cmapTexture.format = RGBFormat
            cmapTexture.needsUpdate = true
            cmapTexture.minFilter = LinearFilter
            cmapTexture.maxFilter = LinearFilter

            const loader = new TextureLoader();

            const cmap = await loader.loadAsync('/colormaps/cbrewerSpeed3.png')
//           const cmap = await loader.loadAsync('/colormaps/cmoceanSpeed.png')
//           const cmap = await loader.loadAsync('/colormaps/cmoceanAmp.png')

            const materialWinds = new ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                depthWrite: false,
                side: DoubleSide,
                uniforms:
                {
                    texturePosition: { value: null },
                    cmapTexture: { value: cmap },
                    quaternionTexture: { value: quaternionTexture },
                    thisWindsFrame : {value: thisWindsFrame },
                    nextWindsFrame : {value: nextWindsFrame },
                    wrapAmountUniform: shaderUniforms.uSphereWrapAmount,
                    uFrameWeight: shaderUniforms.uFrameWeight,
                    uWindsParticleOpacity: shaderUniforms.uWindsParticleOpacity,
                    uWindsArrowSize: shaderUniforms.uWindsArrowSize,
                    uWindsMaxArrowSize: shaderUniforms.uWindsMaxArrowSize,
                    uWindsParticleLifeTime: shaderUniforms.uWindsParticleLifeTime,
                    uWindsScaleMagnitude: shaderUniforms.uWindsScaleMagnitude,
                    uWindsColorMagnitude: shaderUniforms.uWindsColorMagnitude,
                    uWindsSpeedMin: shaderUniforms.uWindsSpeedMin,
                    uWindsSpeedMax: shaderUniforms.uWindsSpeedMax,
                    uHeightWinds: shaderUniforms.uHeightWinds,
                    uWindsZonalDataMin: shaderUniforms.uWindsZonalDataMin,
                    uWindsZonalDataMax: shaderUniforms.uWindsZonalDataMax,
                    uWindsMeridionalDataMin: shaderUniforms.uWindsMeridionalDataMin,
                    uWindsMeridionalDataMax: shaderUniforms.uWindsMeridionalDataMax,

                }
            })

            const materialJetStream = new ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                depthWrite: false,
                side: DoubleSide,
                uniforms:
                {
                    texturePosition: { value: null },
                    cmapTexture: { value: cmap },
                    quaternionTexture: { value: quaternionTexture },
                    thisWindsFrame : {value: thisWindsFrame },
                    nextWindsFrame : {value: nextWindsFrame },
                    wrapAmountUniform: shaderUniforms.uSphereWrapAmount,
                    uFrameWeight: shaderUniforms.uFrameWeight,
                    uWindsParticleOpacity: shaderUniforms.uJetStreamParticleOpacity,
                    uWindsArrowSize: shaderUniforms.uJetStreamArrowSize,
                    uWindsMaxArrowSize: shaderUniforms.uJetStreamMaxArrowSize,
                    uWindsParticleLifeTime: shaderUniforms.uJetStreamParticleLifeTime,
                    uWindsScaleMagnitude: shaderUniforms.uJetStreamScaleMagnitude,
                    uWindsColorMagnitude: shaderUniforms.uJetStreamColorMagnitude,
                    uWindsSpeedMin: shaderUniforms.uJetStreamSpeedMin,
                    uWindsSpeedMax: shaderUniforms.uJetStreamSpeedMax,
                    uHeightWinds: shaderUniforms.uHeightJetStream,
                    uWindsZonalDataMin: shaderUniforms.uJetStreamZonalDataMin,
                    uWindsZonalDataMax: shaderUniforms.uJetStreamZonalDataMax,
                    uWindsMeridionalDataMin: shaderUniforms.uJetStreamMeridionalDataMin,
                    uWindsMeridionalDataMax: shaderUniforms.uJetStreamMeridionalDataMax,

                }
            })


        if (layerHeight == "surface") {

            const material = materialWinds
            return {material}

        } else if (layerHeight == "jetStream") {
    
            const material = materialJetStream

            return {material}

        }


}

export {createWindsMaterial}