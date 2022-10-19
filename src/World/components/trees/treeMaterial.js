import { ShaderMaterial, ShaderLib, ShaderChunk} from 'three';
import { cmapID, timeControl } from '../../systems/initialModelConfig.js';
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'

function createTreeMaterial(surfaceHeightImage, surfacePFTImage, color, pftChannel, shaderUniforms) {

    // load climate model data
    const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.currentTimeFrame)
    const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.nextTimeFrame)

    const thisPFTFrame = textureFromCanvas(surfacePFTImage, cmapID.fillMethod, timeControl.currentTimeFrame)
    const nextPFTFrame = textureFromCanvas(surfacePFTImage, cmapID.fillMethod, timeControl.nextTimeFrame)

    var uniformsPhysical = 
        {
          uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
          uFrameWeight: shaderUniforms.uFrameWeight,
          uHeightGridXOffset: {value: 0.00725 },
          uHeightDisplacement : shaderUniforms.uHeightDisplacement,
          uTreeSize : shaderUniforms.uTreeSize,
          uAllowVegetation : shaderUniforms.uAllowVegetation,
          uColor : {value: color },
          uPFTChannel : {value: pftChannel },
          thisHeightFrame : {value: thisHeightFrame },
          nextHeightFrame : {value: nextHeightFrame },
          thisPFTFrame : {value: thisPFTFrame },
          nextPFTFrame : {value: nextPFTFrame },
          reflectivity : {value: 0.0 },

 //       ...ShaderLib.physical.uniforms,
        ...ShaderLib.lambert.uniforms,
        }
    
    const material = new ShaderMaterial( {
        vertexShader: monkeyPatch(ShaderChunk.meshlambert_vert, {
        header: `
            #define M_PI 3.14159265

            uniform sampler2D thisHeightFrame;
            uniform sampler2D nextHeightFrame;
            uniform sampler2D thisPFTFrame;
            uniform sampler2D nextPFTFrame;

            uniform float uSphereWrapAmount;
            uniform float uHeightDisplacement;
            uniform float uHeightGridXOffset;
            uniform float uFrameWeight;
            uniform float uTreeSize;
            uniform float uPFTChannel;
            uniform float uAllowVegetation;

            attribute vec3 positions;
            attribute vec2 gridUV;
            attribute vec4 quaternions;

            vec3 anglesToSphereCoord(vec2 a, float r) {

                return vec3(
                    r * sin(a.y) * sin(a.x),
                    r * sin(a.y) * cos(a.x), 
                    -1. * r * cos(a.y)
                );
            
            }

            float map(float value, float inMin, float inMax, float outMin, float outMax) {
                return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
              }
                    
        `,
        // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
        main: `

            vec2 vUv = gridUV;
            vUv.x += uHeightGridXOffset; 
            //vUv.x += 0.00725; 

            vec4 heightValueInt = mix(texture2D(thisHeightFrame,vUv),texture2D(nextHeightFrame,vUv),uFrameWeight);
    
            vec2 vUvPFT = gridUV;
            vUvPFT.x += 0.00725; 
            //vUvPFT.x += uHeightGridXOffset; 

            vec2 vUvPFTSphere = gridUV;
            //vUvPFTSphere.x -= 0.00725;

            vec4 PFTValueInt = mix(texture2D(thisPFTFrame,vUvPFT),texture2D(nextPFTFrame,vUvPFT),uFrameWeight) * uAllowVegetation;

            
            // apply quaternion rotation depending on uSphereWrapAmount
           vec3 vPosition = position + ( 2.0 * cross( quaternions.xyz, cross( quaternions.xyz, position ) + quaternions.w * position ) * uSphereWrapAmount);
 
            // scale trees by PFT data
            if (heightValueInt.r >= 0.5) {

              if (uPFTChannel == 1.) {
                vPosition *= uTreeSize * PFTValueInt.r;
              } else if (uPFTChannel == 2.) {
                vPosition *= uTreeSize * PFTValueInt.g;
              } else if (uPFTChannel == 3.) {
                vPosition *= uTreeSize * PFTValueInt.b;
              }
              

            } else {

              // mask ocean values
              vPosition *=  0.;

            }

            // calculate positions on plane
            vec3 planePos = vPosition + positions;
            float heightDisplacement =  ( heightValueInt.r - 0.5 ) * uHeightDisplacement ;
            planePos.y += heightDisplacement * 100. ;

            // calculate positions on sphere
            vec2 angles = M_PI * vec2(2. * vUvPFTSphere.x , vUvPFTSphere.y - 1.);
            vec3 sphPos = vPosition + anglesToSphereCoord(angles, 100.0 + heightDisplacement * 100. );

            // interpolate between both positions
            vec3 wrapPos = mix(planePos, sphPos, uSphereWrapAmount);

            //vec3 displacedNormal = mix(normal, sphereNormals, uSphereWrapAmount);
            vec3 displacedNormal = normal + ( 2.0 * cross( quaternions.xyz, cross( quaternions.xyz, normal ) + quaternions.w * normal ) * uSphereWrapAmount);
            //vec3 displacedNormal = normal;


        `,
        
        '#include <defaultnormal_vertex>': ShaderChunk.defaultnormal_vertex.replace(
          // transformedNormal will be used in the lighting calculations
          'vec3 transformedNormal = objectNormal;',
          `vec3 transformedNormal = displacedNormal;`
        ),

          // transformed is the output position
          '#include <project_vertex>': ShaderChunk.project_vertex.replace(
            // transformedNormal will be used in the lighting calculations
            'vec4 mvPosition = vec4( transformed, 1.0 );',
            `vec4 mvPosition = vec4( wrapPos, 1.0 );`
          ),
    
        }),
        fragmentShader: monkeyPatch(ShaderChunk.meshlambert_frag, {
        header: `

          uniform vec3 uColor;


        `,
        // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
        main: `

        `,

            'vec4 diffuseColor = vec4( diffuse, opacity );':`

            vec4 diffuseColor = vec4(uColor, opacity);

            `,


            'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;':`
            
            vec3 outgoingLight = reflectedLight.directDiffuse + .7 * reflectedLight.indirectDiffuse;

            `,
    
        }),

        wireframe: false,
        transparent: true,
        lights: true,

        // extensions: {
        // derivatives: true,
        // },

        defines: {
        STANDARD: '',
        PHYSICAL: '',
        },

        uniforms: uniformsPhysical

    } )

return {material}

}


function monkeyPatch(shader, { defines = '', header = '', main = '', ...replaces }) {
  let patchedShader = shader

  const replaceAll = (str, find, rep) => str.split(find).join(rep)
  Object.keys(replaces).forEach((key) => {
    patchedShader = replaceAll(patchedShader, key, replaces[key])
  })

  patchedShader = patchedShader.replace(
    'void main() {',
    `
    ${header}
    void main() {
      ${main}
    `
  )

  return `
    ${defines}
    ${patchedShader}
  `
}

export {createTreeMaterial}