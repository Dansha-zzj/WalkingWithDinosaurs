import { PlaneBufferGeometry , ShaderMaterial, Mesh, ShaderLib, ShaderChunk, RepeatWrapping, Vector2, LinearFilter, NearestFilter } from 'three';
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { cmapID } from '../systems/initialModelConfig.js'
import { loadTexture2Uniform } from '../systems/texture2Uniform.js'
import { createColormapTexture } from '../systems/colormapTexture.js'

async function createCustomSurfaceNextMillion(tasDataImage, surfaceHeightImage, modelConfig, shaderUniforms, timeControl) {
  //const loader = new TextureLoader();

  const thisTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  //  const [ colorMapTAS ] = await Promise.all([

  //   loadTexture2Uniform('/colormaps/ipccTemp.png'),
  // //   //loadTexture2Uniform('/colormaps/cmapTopo4.png'),
  // //   //loadTexture2Uniform('/modelData/BRIDGE/tfgzk/tfgzk_height.smoothed.png'),
  // //   loadTexture2Uniform('/modelData/BRIDGE/emulator/tdaba.height.png'),

  //  ]);

  const iceTexture = await loadTexture2Uniform('/textures/fantasyIceTexture.jpg')

  const colorMapTAS = createColormapTexture('RdBu_custom')
  const colorMapHeight = createColormapTexture('topography')


  const numLongitude = 96
  const numLatitude = 73

  const geometry = new PlaneBufferGeometry(4, 2, numLongitude * modelConfig.gridMultiplier, numLatitude * modelConfig.gridMultiplier);

  var uniformsPhysical = 
    {
    uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
    uFrameWeight: shaderUniforms.uFrameWeight,
    uHeightDisplacement: shaderUniforms.uHeightDisplacement,
    uHeightGridXOffset: shaderUniforms.uHeightGridXOffset,
    uOpacitySurface: shaderUniforms.uOpacitySurface,
    uOpacityTemp: shaderUniforms.uOpacityTemp,
    uOpacityIce: shaderUniforms.uOpacityIce,
    uTempMinValue: shaderUniforms.uTempMinValue,
    uTempMaxValue: shaderUniforms.uTempMaxValue,
    uShowLandIce: shaderUniforms.uShowLandIce,
    thisTASFrame : {value: thisTASFrame },
    nextTASFrame : {value: nextTASFrame },
    thisHeightFrame : {value: thisHeightFrame },
    nextHeightFrame : {value: nextHeightFrame },
    colorMapTAS : {value: colorMapTAS },
    colorMapHeight : {value: colorMapHeight },
    iceTexture : {value: iceTexture },
    ...ShaderLib.lambert.uniforms,
    }

  const materialLights = new ShaderMaterial( {
    vertexShader: monkeyPatch(ShaderChunk.meshphong_vert, {
      header: `
        #define M_PI 3.14159265

        uniform float uSphereWrapAmount;
        uniform float uFrameWeight;
        uniform float uHeightDisplacement;

        uniform sampler2D thisHeightFrame;
        uniform sampler2D nextHeightFrame;

        varying vec2 vUv;

        // http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
        vec3 orthogonal(vec3 v) {
          return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0)
          : vec3(0.0, -v.z, v.y));
        }

        vec3 anglesToSphereCoord(vec2 a, float r) {

          return vec3(
              r * sin(a.y) * sin(a.x),
              r * cos(a.y),
              r * sin(a.y) * cos(a.x)  
          );
      
      }
      `,
      // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
      main: `

        float vHEIGHT = mix(texture2D(thisHeightFrame,uv).x,texture2D(nextHeightFrame,uv).x,uFrameWeight);

        if (vHEIGHT <= 0.5) {
          vHEIGHT = 0.5;
        }

        vec4 heightValueIntNeigbour1;
        vec4 heightValueIntNeigbour2;

        vUv = uv;    

        heightValueIntNeigbour1 = mix(texture2D(thisHeightFrame,vUv-vec2(0.005,0.005)), texture2D(nextHeightFrame,vUv-vec2(0.005,0.005)),uFrameWeight );
        heightValueIntNeigbour2 = mix(texture2D(thisHeightFrame,vUv+vec2(0.005,0.005)), texture2D(nextHeightFrame,vUv+vec2(0.005,0.005)),uFrameWeight );

        float heightDisplacement =  (vHEIGHT-0.5) * uHeightDisplacement;

        float heightDisplacementNeigbour1 =  (heightValueIntNeigbour1.r-0.5) * uHeightDisplacement;
        float heightDisplacementNeigbour2 =  (heightValueIntNeigbour2.r-0.5) * uHeightDisplacement;

        vec3 displacedPosition = position;
        displacedPosition.z += heightDisplacement;

        vec2 angles = M_PI * vec2(2. * uv.x, uv.y - 1.);
        vec3 sphPosDefault = anglesToSphereCoord(angles, 1.0 );
        vec3 sphPos = anglesToSphereCoord(angles, 1.0 + heightDisplacement );
        vec3 wrapPos = mix(displacedPosition, sphPos, uSphereWrapAmount);

        vec3 newNormal = normal;

        float offset = 4.0 / 96.0 / 2.0;
        vec3 tangent = orthogonal(newNormal);
        vec3 bitangent = normalize(cross(newNormal, tangent));
        vec3 neighbour1 = position + tangent * offset;
        vec3 neighbour2 = position + bitangent * offset;
        vec3 displacedNeighbour1 = neighbour1 + newNormal * heightDisplacementNeigbour1;
        vec3 displacedNeighbour2 = neighbour2 + newNormal * heightDisplacementNeigbour2;
  
        // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
        vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
        vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
  
        // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
        vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));

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

        // '#include <project_vertex>': ShaderChunk.project_vertex.replace(
        //   // transformedNormal will be used in the lighting calculations
        //   'vec4 mvPosition = vec4( transformed, 1.0 );',
        //   'vec4 mvPosition = vec4( wrapPos, 1.0 );',
        // ),
  
    }),
    fragmentShader: monkeyPatch(ShaderChunk.meshphong_frag, {
      header: `
        uniform float uOpacitySurface;
        uniform float uOpacityTemp;
        uniform float uOpacityIce;
        uniform float uFrameWeight;
        uniform float uTempMinValue;
        uniform float uTempMaxValue;

        uniform sampler2D colorMapTAS;
        uniform sampler2D colorMapHeight;
        uniform sampler2D thisHeightFrame;
        uniform sampler2D nextHeightFrame;
        uniform sampler2D thisTASFrame;
        uniform sampler2D nextTASFrame;
        uniform sampler2D iceTexture;

        varying vec2 vUv;
        varying float vHEIGHT;

        // remap color range
        float remap(float value, float inMin, float inMax, float outMin, float outMax) {

            float outValue = outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);

            return clamp(outValue, outMin, outMax);
    
        }

        // convert float to color via colormap
        vec4 applyColormap(float t, sampler2D colormap){

          return(texture2D(colormap,vec2(t,0.5)));

        }

        // custom bicubic texture filtering as an alternative to the standard nearest neighbor and bilinear resampling
// more expensive, needs 4 bilinear lookups
// smoother results, but underestimates peak values (different for bilinear filtering)
// from https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl

vec4 cubic(float v) {

    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;

    return vec4(x, y, z, w) * (1.0/6.0);

}

vec4 textureBicubic(sampler2D sampler, vec2 texCoords, float numLon, float numLat) {

    vec2 texSize = vec2(numLon, numLat);

    vec2 invTexSize = 1.0 / texSize;

    texCoords = texCoords * texSize - 0.5;

        vec2 fxy = fract(texCoords);
        texCoords -= fxy;

        vec4 xcubic = cubic(fxy.x);
        vec4 ycubic = cubic(fxy.y);

        vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;

        vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
        vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;

        offset *= invTexSize.xxyy;
        
        vec4 sample0 = texture2D(sampler, offset.xz);
        vec4 sample1 = texture2D(sampler, offset.yz);
        vec4 sample2 = texture2D(sampler, offset.xw);
        vec4 sample3 = texture2D(sampler, offset.yw);

        float sx = s.x / (s.x + s.y);
        float sy = s.z / (s.z + s.w);

        return mix(
        mix(sample3, sample2, sx), mix(sample1, sample0, sx)
        , sy);

    }

      `,
      // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
      main: `

      `,
      

        'vec4 diffuseColor = vec4( diffuse, opacity );':`

          vec4 heightValueInt = mix(texture2D(thisHeightFrame,vUv),texture2D(nextHeightFrame,vUv),uFrameWeight);
          //vec4 heightValueInt = mix(textureBicubic(thisHeightFrame,vUv,96.,73.),textureBicubic(nextHeightFrame,vUv,96.,73.),uFrameWeight);

          if (heightValueInt.x < 0.5 && heightValueInt.y > 0.5) {
            heightValueInt.x = 0.5;
          } else if (heightValueInt.x > 0.5 && heightValueInt.y < 0.5) {
            heightValueInt.x = 0.49;
          }

          vec4 heightColor = applyColormap( heightValueInt.x, colorMapHeight );
          heightColor = mix(heightColor, vec4(1.), 0.0);

          //float tasValueInt = mix(texture2D(thisTASFrame,vUv).x,texture2D(nextTASFrame,vUv).x,uFrameWeight);
          float tasValueInt = mix(textureBicubic(thisTASFrame,vUv,96.,73.).x,textureBicubic(nextTASFrame,vUv,96.,73.).x,uFrameWeight);

          float tasValueExpanded = remap( tasValueInt, 0.0, 1.0, -20.0, 20.0 );
          float tasValueRemapped = remap( tasValueExpanded, uTempMinValue, uTempMaxValue, 0.0, 1.0 );

          vec4 tasColor = applyColormap( tasValueRemapped, colorMapTAS );

          vec4 diffuseColor;


          // mix in land ice
          heightColor = mix(heightColor, texture2D( iceTexture, vUv * 20.0 ), heightValueInt.z * uOpacityIce);
          // mix in sea ice
          heightColor = mix(heightColor, texture2D( iceTexture, vUv * 20.0 ), clamp((1. - heightValueInt.y) * heightValueInt.z * 2.0 * uOpacityIce,0.,1.));

          float interval = 1./22.;
          //float interval = 0.0;
          float lowerBoundary = 0.5 - interval;
          float upperBoundary = 0.5 + interval;

          if ( tasValueInt <= lowerBoundary || tasValueInt >= upperBoundary ) {


            //diffuseColor = 0.7 * tasColor + heightValueInt.z * 0.3 * heightColor + 0.3 * (1.0 - heightValueInt.z) * tasColor;
            //diffuseColor = ( 1.0 - uOpacityTemp ) * heightColor + uOpacityTemp * tasColor * 0.7;

            diffuseColor = mix(heightColor,tasColor,clamp(uOpacityTemp,0., 1.0 - heightValueInt.y * heightValueInt.z * uOpacityIce ));

          } else {

            diffuseColor = heightColor;

          }
           
          //diffuseColor = heightColor;

          

          if (heightValueInt.y > 0.4 && heightValueInt.y < 0.6) {

            diffuseColor = vec4(0.,0.,0.,1.);

          }



          //diffuseColor.a = uOpacitySurface;

        `,

        //'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;':`

        //vec3 outgoingLight = reflectedLight.directDiffuse + ( 0.1 + 0.9 * ( 1. - uOpacityTemp )) * reflectedLight.indirectDiffuse + totalEmissiveRadiance;


        'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;':`
        
        vec3 outgoingLight;
        if (heightValueInt.x < 0.5) {
          outgoingLight = 3. * reflectedLight.indirectDiffuse ;
        } else {
          outgoingLight = reflectedLight.directDiffuse + ( .8 * reflectedLight.indirectDiffuse) + totalEmissiveRadiance;
        }
        //vec3 outgoingLight = reflectedLight.directDiffuse + ( .8 * reflectedLight.indirectDiffuse) + totalEmissiveRadiance;
        

        `,

  
    }),
    // fragmentShader: ShaderLib.physical.fragmentShader
    //           .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
    //               vec3 diffuse = vec3(0.0, 0.9, 0.3);
    //               vec4 diffuseColor = vec4( diffuse, opacity );
    //           `),
    wireframe: false,
    transparent: true,
    lights: true,
    depthWrite: true,
    // extensions: {
    //   derivatives: true,
    // },

    // defines: {
    //   STANDARD: '',
    //   PHYSICAL: '',
    // },


    uniforms: uniformsPhysical
} );

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

  const surface = new Mesh( geometry, materialLights );
  surface.frustumCulled = false

  // define function to update texture if keyFrame changes
  surface.tick = (frame, direction) => { 


    if(direction == 'backInTime') {
     //console.log('backward to '+frame)

      surface.material.uniforms.nextTASFrame.value = surface.material.uniforms.thisTASFrame.value
      const thisTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
      surface.material.uniforms.thisTASFrame.value = thisTASFrame

      surface.material.uniforms.nextHeightFrame.value = surface.material.uniforms.thisHeightFrame.value
      const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.currentTimeFrame)
      surface.material.uniforms.thisHeightFrame.value = thisHeightFrame


    } else if(direction == 'forwardInTime') {
     //console.log('forward to '+frame)

      surface.material.uniforms.thisTASFrame.value = surface.material.uniforms.nextTASFrame.value
      const nextTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)
      surface.material.uniforms.nextTASFrame.value = nextTASFrame

      surface.material.uniforms.thisHeightFrame.value = surface.material.uniforms.nextHeightFrame.value
      const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.nextTimeFrame)
      surface.material.uniforms.nextHeightFrame.value = nextHeightFrame

    }
  }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    surface.resetTextures = async (timeControl, filter) => { 
    
      surface.material.uniforms.thisTASFrame.value = textureFromCanvas(tasDataImage, filter, timeControl.currentTimeFrame)
  
    }

    surface.setGeometryResolution = () => { 
    
      surface.geometry.dispose()
      surface.geometry = new PlaneBufferGeometry(4, 2, numLongitude * modelConfig.gridMultiplier, numLatitude * modelConfig.gridMultiplier);
      
    }

  return surface;
}

export { createCustomSurfaceNextMillion };
