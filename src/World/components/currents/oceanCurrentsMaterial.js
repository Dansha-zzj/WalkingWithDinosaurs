import { ShaderMaterial, Color, DataTexture, RGBFormat, LinearFilter, TextureLoader, DoubleSide, BackSide, NoBlending} from 'three';
import { cmapID, timeControl } from '../../systems/initialModelConfig.js';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'
import vertexShaderArrows from '../../../shaders/oceanCurrents.vert'
import fragmentShader from '../../../shaders/oceanCurrents.frag'

async function createOceanCurrentsMaterial(currentsDataImage, quaternionTexture, shaderUniforms) {

    // load climate model data
    const thisCurrentsFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
    const nextCurrentsFrame = textureFromCanvas(currentsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

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

        const material = new ShaderMaterial({
            vertexShader: vertexShaderArrows,
            fragmentShader: fragmentShader,
            transparent: true,
            depthWrite: false,
            side: DoubleSide,
            uniforms:
            {
                texturePosition: { value: null },
                cmapTexture: { value: cmap },
                quaternionTexture: { value: quaternionTexture },
                thisCurrentsFrame : {value: thisCurrentsFrame },
                nextCurrentsFrame : {value: nextCurrentsFrame },
                uHeightDisplacement: shaderUniforms.uHeightDisplacement,
                wrapAmountUniform: shaderUniforms.uSphereWrapAmount,
                uFrameWeight: shaderUniforms.uFrameWeight,
                uOceanParticleDepth: shaderUniforms.uOceanParticleDepth,
                uOceanParticleOpacity: shaderUniforms.uOceanParticleOpacity,
                uOceanParticleSize: shaderUniforms.uOceanParticleSize,
                uOceanArrowSize: shaderUniforms.uOceanArrowSize,
                uOceanParticleLifeTime: shaderUniforms.uOceanParticleLifeTime,
                uScaleMagnitude: shaderUniforms.uScaleMagnitude,
                uColorMagnitude: shaderUniforms.uColorMagnitude,
                uColorDepth: shaderUniforms.uColorDepth,
                uColorUpwelling: shaderUniforms.uColorUpwelling,
                uSpeedMax: shaderUniforms.uSpeedMax,
                uZoom: shaderUniforms.uZoom
            }
        })

    

return {material}

}

export {createOceanCurrentsMaterial}