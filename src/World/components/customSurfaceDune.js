import { PlaneBufferGeometry , ShaderMaterial, Mesh, ShaderLib, ShaderChunk, RepeatWrapping, Vector2, LinearFilter, NearestFilter } from 'three';
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { cmapID } from '../systems/initialModelConfig.js'
import { loadTexture2Uniform } from '../systems/texture2Uniform.js'

async function createCustomSurfaceDune(tasDataImage, modelConfig, shaderUniforms, timeControl) {
  //const loader = new TextureLoader();

  const thisTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const [ colorMapTAS, desertTextureLow, desertTextureMed, desertTextureHigh, sandduneTexture, surfaceHeightTexture, duneHeightTexture ] = await Promise.all([

    loadTexture2Uniform('/colormaps/ipccTemp.png'),
    loadTexture2Uniform('/textures/desert_planet_texture_tile_by_d3cline_d4rivig.png'),
    loadTexture2Uniform('/textures/AgeoftheCanyon.jpg'),
    loadTexture2Uniform('/textures/MartianRange.jpg'),
    loadTexture2Uniform('/textures/smooth+sand+dunes-512x512.jpg'),
    loadTexture2Uniform('/modelData/BRIDGE/tfgzk/tfgzk_height.smoothed.png'),
    loadTexture2Uniform('/modelData/BRIDGE/tfgzk/tfgzk_duneHeight.ym.png')

  ]);

  const numLongitude = 96
  const numLatitude = 73

  const geometry = new PlaneBufferGeometry(4, 2, numLongitude * modelConfig.gridMultiplier, numLatitude * modelConfig.gridMultiplier);

  var uniformsPhysical = 
    {
    uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
    uFrameWeight: shaderUniforms.uFrameWeight,
    uHeightDisplacement: shaderUniforms.uHeightDisplacement,
    uHeightDisplacementDunes: shaderUniforms.uHeightDisplacementDunes,
    uHeightGridXOffset: shaderUniforms.uHeightGridXOffset,
    uOpacitySurface: shaderUniforms.uOpacitySurface,
    uOpacityTemp: shaderUniforms.uOpacityTemp,
    uOpacityDunes: shaderUniforms.uOpacityDunes,
    uTempMinValue: shaderUniforms.uTempMinValue,
    uTempMaxValue: shaderUniforms.uTempMaxValue,
    uShowLandIce: shaderUniforms.uShowLandIce,
    uMinDuneHeight: shaderUniforms.uMinDuneHeight,
    uMaxDuneHeight: shaderUniforms.uMaxDuneHeight,
    thisTASFrame : {value: thisTASFrame },
    nextTASFrame : {value: nextTASFrame },
    desertTextureLow : {value: desertTextureLow },
    desertTextureMed : {value: desertTextureMed },
    desertTextureHigh : {value: desertTextureHigh },
    sandduneTexture : {value: sandduneTexture },
    thisHeightFrame : {value: surfaceHeightTexture },
    duneHeightFrame : {value: duneHeightTexture },
    colorMapTAS : {value: colorMapTAS },
    ...ShaderLib.lambert.uniforms,
    }

  const materialLights = new ShaderMaterial( {
    vertexShader: monkeyPatch(ShaderChunk.meshphong_vert, {
      header: `
        #define M_PI 3.14159265

        uniform float uSphereWrapAmount;
        uniform float uFrameWeight;
        uniform float uHeightDisplacement;
        uniform float uOpacityDunes;
        uniform float uHeightDisplacementDunes;
        uniform float uMinDuneHeight;

        uniform sampler2D thisHeightFrame;
        uniform sampler2D duneHeightFrame;

        varying vec2 vUv;
        varying float vHEIGHT;
        varying float vDUNEHEIGHT;

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

        vHEIGHT = texture2D(thisHeightFrame,uv).x;
        vDUNEHEIGHT = texture2D(duneHeightFrame,uv).x;

        //vHEIGHT = vHEIGHT + uHeightDisplacementDunes * vDUNEHEIGHT * uOpacityDunes;

        vec4 heightValueIntNeigbour1;
        vec4 heightValueIntNeigbour2;

        vec4 duneHeightValueIntNeigbour1;
        vec4 duneHeightValueIntNeigbour2;

        vUv = uv;    

        heightValueIntNeigbour1 = texture2D(thisHeightFrame,vUv-vec2(0.005,0.005));
        heightValueIntNeigbour2 = texture2D(thisHeightFrame,vUv+vec2(0.005,0.005));

        // if (vDUNEHEIGHT > uMinDuneHeight) {

        //   duneHeightValueIntNeigbour1 = texture2D(duneHeightFrame,vUv-vec2(0.005,0.005));
        //   duneHeightValueIntNeigbour2 = texture2D(duneHeightFrame,vUv+vec2(0.005,0.005));

        // } else {

        //   duneHeightValueIntNeigbour1 = vec4(0.);
        //   duneHeightValueIntNeigbour2 = vec4(0.);
        //   vDUNEHEIGHT = 0.0;

        // }

        duneHeightValueIntNeigbour1 = texture2D(duneHeightFrame,vUv-vec2(0.005,0.005));
        duneHeightValueIntNeigbour2 = texture2D(duneHeightFrame,vUv+vec2(0.005,0.005));

        vDUNEHEIGHT -= uMinDuneHeight;
        duneHeightValueIntNeigbour1 -= uMinDuneHeight;
        duneHeightValueIntNeigbour2 -= uMinDuneHeight;

        if (vDUNEHEIGHT <= 0.) {
          vDUNEHEIGHT = 0.;
        }
        if (duneHeightValueIntNeigbour1.r <= 0.) {
          duneHeightValueIntNeigbour1.r = 0.;
        }
        if (duneHeightValueIntNeigbour2.r <= 0.) {
          duneHeightValueIntNeigbour2.r = 0.;
        }

        float heightDisplacement =  vHEIGHT * uHeightDisplacement + uHeightDisplacementDunes * vDUNEHEIGHT * uOpacityDunes;

        float heightDisplacementNeigbour1 =  heightValueIntNeigbour1.r * uHeightDisplacement + uHeightDisplacementDunes * duneHeightValueIntNeigbour1.r * uOpacityDunes;
        float heightDisplacementNeigbour2 =  heightValueIntNeigbour2.r * uHeightDisplacement + uHeightDisplacementDunes * duneHeightValueIntNeigbour2.r * uOpacityDunes;

        vec3 displacedPosition = position;
        displacedPosition.z += heightDisplacement;

        vec2 angles = M_PI * vec2(2. * uv.x, uv.y - 1.);
        vec3 sphPosDefault = anglesToSphereCoord(angles, 1.0 );
        vec3 sphPos = anglesToSphereCoord(angles, 1.0 + heightDisplacement );
        vec3 wrapPos = mix(displacedPosition, sphPos, uSphereWrapAmount);

     //   vec3 newNormal = mix(normal,sphPos,uSphereWrapAmount);
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
        uniform float uOpacityDunes;
        uniform float uFrameWeight;
        uniform float uTempMinValue;
        uniform float uTempMaxValue;
        uniform float uMinDuneHeight;
        uniform float uMaxDuneHeight;

        uniform sampler2D desertTextureLow;
        uniform sampler2D desertTextureMed;
        uniform sampler2D desertTextureHigh;
        uniform sampler2D sandduneTexture;
        uniform sampler2D colorMapTAS;
        uniform sampler2D thisTASFrame;
        uniform sampler2D nextTASFrame;


        varying vec2 vUv;
        varying float vHEIGHT;
        varying float vDUNEHEIGHT;

        // varying vec3 vNormal;

        // remap color range
        float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    
            return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
    
        }

        // convert float to color via colormap
        vec4 applyColormap(float t, sampler2D colormap){

          return(texture2D(colormap,vec2(t,0.5)));

        }

      `,
      // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
      main: `

      `,
      

        'vec4 diffuseColor = vec4( diffuse, opacity );':`

          // texture splatting from https://stackoverflow.com/questions/18880715/texture-splatting-with-three-js
          vec4 low = (smoothstep(-0.05, 0.1, vHEIGHT) - smoothstep(0.1, 0.2, vHEIGHT) ) * texture2D( desertTextureLow, vUv * 6.0 );
          vec4 med = (smoothstep(0.1, 0.2, vHEIGHT) - smoothstep(0.4, 0.6, vHEIGHT) ) * texture2D( desertTextureMed, vUv * 20.0 );
          vec4 high = (smoothstep(0.4, 0.6, vHEIGHT) ) * texture2D( desertTextureHigh, vUv * 10.0 );

          vec4 surfaceColor = low + med + high;

          // overlay sand dune height
          float duneWeight = (vDUNEHEIGHT) / (uMaxDuneHeight-uMinDuneHeight);
          if (duneWeight > 1.0) {
            duneWeight = 1.0;
          }
          surfaceColor = mix(surfaceColor, texture2D( sandduneTexture, vUv * 10.0 ), duneWeight * uOpacityDunes);

          surfaceColor.a = uOpacitySurface;

          float vTAS = mix(texture2D(thisTASFrame,vUv).x,texture2D(nextTASFrame,vUv).x,uFrameWeight);

          float tasValueExpanded = remap( vTAS, 0.0, 1.0, -49.9, 49.9 );
          float tasValueRemapped = remap( tasValueExpanded, uTempMinValue, uTempMaxValue, 0.0, 1.0 );
      
          vec4 diffuseColor;

          if(tasValueRemapped > 0.0 && tasValueRemapped <= 1.0) {

            vec4 tasColor = applyColormap( tasValueRemapped, colorMapTAS );
            diffuseColor = mix(surfaceColor, tasColor, uOpacityTemp);

          } else {

            diffuseColor = surfaceColor;

          }

          //diffuseColor.a = uOpacitySurface;

        `,

        //'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;':`

        //vec3 outgoingLight = reflectedLight.directDiffuse + ( 0.1 + 0.9 * ( 1. - uOpacityTemp )) * reflectedLight.indirectDiffuse + totalEmissiveRadiance;

        'vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;':`

        vec3 outgoingLight = reflectedLight.directDiffuse + ( 0.1 + 0.9 * ( 1. - uOpacityTemp )) * reflectedLight.indirectDiffuse + totalEmissiveRadiance;

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

  // define function to update texture if keyFrame changes
  surface.tick = (frame, direction) => { 


    if(direction == 'backInTime') {
     //console.log('backward to '+frame)

      surface.material.uniforms.nextTASFrame.value = surface.material.uniforms.thisTASFrame.value
      const thisTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
      surface.material.uniforms.thisTASFrame.value = thisTASFrame

    } else if(direction == 'forwardInTime') {
     //console.log('forward to '+frame)

      surface.material.uniforms.thisTASFrame.value = surface.material.uniforms.nextTASFrame.value
      const nextTASFrame = textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)
      surface.material.uniforms.nextTASFrame.value = nextTASFrame

    }
  }

  // define function to change texture filtering
  surface.changeFilter = (timeControl, oldFilter, newFilter) => { 

    surface.material.uniforms.thisTASFrame.value = textureFromCanvas(tasDataImage, oldFilter, timeControl.currentTimeFrame)
    surface.material.uniforms.nextTASFrame.value = textureFromCanvas(tasDataImage, newFilter, timeControl.currentTimeFrame)

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

export { createCustomSurfaceDune };
