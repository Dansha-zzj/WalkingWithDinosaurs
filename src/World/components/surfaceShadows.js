import { TextureLoader, ImageLoader, PlaneBufferGeometry, SphereBufferGeometry, ShaderMaterial, MeshBasicMaterial, Mesh, UniformsUtils, UniformsLib, ShaderLib, ShaderChunk, RepeatWrapping, Vector2, LinearFilter, NearestFilter } from 'three';
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { cmapID, timeControl } from '../systems/initialModelConfig.js'
import gsap from 'gsap'

let uOpacity = {type: 'f', value: 1};

async function createSurface(modelConfig, surfacePFT1Image, surfacePFT2Image, surfaceHeightImage, shaderUniforms) {
  const loader = new TextureLoader();
  
  // Load all required data and textures async and only continue if all are available
  //const [colorMap, grassTexture, sandTexture, shrubTexture, bltTexture, nltTexture, snowTexture] = await Promise.all([
  const [colorMap, grassTexture, sandTexture, shrubTexture, bltTexture, nltTexture, snowTexture] = await Promise.all([ 
    loader.loadAsync('/colormaps/cmap' + cmapID.name + '.png'),
//    loader.loadAsync('/textures/grass4b.jpg'),
    loader.loadAsync('/textures/grass_bluemarble_seamless.jpeg'),
 //   loader.loadAsync('/textures/sand2b.jpg'),
    loader.loadAsync('/textures/sand_bluemarble_seamless.jpg'),
 //   loader.loadAsync('/textures/shrubs3a.jpg'),
    loader.loadAsync('/textures/shrubs_bluemarble_seamless.jpg'),
//    loader.loadAsync('/textures/blt2b.jpg'),
    loader.loadAsync('/textures/blt_bluemarble_seamless.jpeg'),
//    loader.loadAsync('/textures/nlt1b.jpg'),
    loader.loadAsync('/textures/nlt_bluemarble_seamless.jpg'),
 //   loader.loadAsync('/textures/snow1b.jpg'),
    loader.loadAsync('/textures/ice_bluemarble_seamless.jpg'),
    
  ]);

  grassTexture.wrapS = RepeatWrapping
  grassTexture.wrapT = RepeatWrapping
  sandTexture.wrapS = RepeatWrapping
  sandTexture.wrapT = RepeatWrapping
  shrubTexture.wrapS = RepeatWrapping
  shrubTexture.wrapT = RepeatWrapping
  bltTexture.wrapS = RepeatWrapping
  bltTexture.wrapT = RepeatWrapping
  nltTexture.wrapS = RepeatWrapping
  nltTexture.wrapT = RepeatWrapping
  snowTexture.wrapS = RepeatWrapping
  snowTexture.wrapT = RepeatWrapping

  const thisPFT1Frame = textureFromCanvas(surfacePFT1Image, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextPFT1Frame = textureFromCanvas(surfacePFT1Image, cmapID.fillMethod, timeControl.nextTimeFrame)

  const thisPFT2Frame = textureFromCanvas(surfacePFT2Image, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextPFT2Frame = textureFromCanvas(surfacePFT2Image, cmapID.fillMethod, timeControl.nextTimeFrame)

  const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, timeControl.nextTimeFrame)

//  const geometry = new PlaneBufferGeometry(4, 2, 360*2, 181*2);
//  const geometry = new PlaneBufferGeometry(4, 2, 96*6, 73*6);
//  const geometry = new PlaneBufferGeometry(4, 2, 96*2, 73*2);

  var numLongitude,numLatitude

  if (modelConfig.heightData === 'Valdes et al. (2021)') {

    numLongitude = 96
    numLatitude = 73

  } else if (modelConfig.heightData === 'Scotese & Wright (1.0 deg)') {

    numLongitude = 360
    numLatitude = 181
  
  } else if (modelConfig.heightData === 'Scotese & Wright (0.25 deg)') {

    numLongitude = 1440
    numLatitude = 720
  
  }

  const geometry = new PlaneBufferGeometry(4, 2, numLongitude * modelConfig.gridMultiplier, numLatitude * modelConfig.gridMultiplier);

  var uniformsPhysical = 
    {
    uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
    uFrameWeight: shaderUniforms.uFrameWeight,
    uHeightDisplacement: shaderUniforms.uHeightDisplacement,
    uHeightGridXOffset: shaderUniforms.uHeightGridXOffset,
    uModifyCoastline: shaderUniforms.uModifyCoastline,
    uCoastlineThreshold: shaderUniforms.uCoastlineThreshold,
    uCoastlineModHighlight: shaderUniforms.uCoastlineModHighlight,
    uOpacitySurface: shaderUniforms.uOpacitySurface,
    uShowLandIce: shaderUniforms.uShowLandIce,
    uPFTsWeight: shaderUniforms.uPFTsWeight,
    uAllowVegetation: shaderUniforms.uAllowVegetation,
    uDarkerOcean: shaderUniforms.uDarkerOcean,
    thisPFT1Frame : {value: thisPFT1Frame },
    nextPFT1Frame : {value: nextPFT1Frame },
    thisPFT2Frame : {value: thisPFT2Frame },
    nextPFT2Frame : {value: nextPFT2Frame },
    thisHeightFrame : {value: thisHeightFrame },
    nextHeightFrame : {value: nextHeightFrame },
    colorMap : {value: colorMap },
    grassTexture : {value: grassTexture },
    sandTexture : {value: sandTexture },
    shrubTexture : {value: shrubTexture },
    bltTexture : {value: bltTexture },
    nltTexture : {value: nltTexture },
    snowTexture : {value: snowTexture },
    ...ShaderLib.lambert.uniforms,
    }
  
  const materialLights = new ShaderMaterial( {
    vertexShader: monkeyPatch(ShaderChunk.meshlambert_vert, {
      header: `
        #define M_PI 3.14159265

        uniform float uSphereWrapAmount;
        uniform float uFrameWeight;
        uniform float uCoastltineThreshold;
        uniform float uHeightDisplacement;
        uniform float uHeightGridXOffset;
        uniform sampler2D thisHeightFrame;
        uniform sampler2D nextHeightFrame;
        uniform bool uModifyCoastline;
        uniform bool uCoastlineModHighlight;

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

      float easeOutQuart(float weight) {

        return 1. - pow(1. - weight, 4.);

        }

      `,
      // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
      main: `

        vec4 heightValueInt;
        vec4 heightValueIntNeigbour1;
        vec4 heightValueIntNeigbour2;

        float heightValueSum;
        float heightValueSumNeigbour1;
        float heightValueSumNeigbour2;

        vUv = uv;
        vUv.x += uHeightGridXOffset;  

        // standard bilinear interpolation
        heightValueInt = mix(texture2D(thisHeightFrame,vUv),texture2D(nextHeightFrame,vUv),uFrameWeight);
        heightValueIntNeigbour1 = mix(texture2D(thisHeightFrame,vUv-vec2(0.005,0.005)),texture2D(nextHeightFrame,vUv-vec2(0.005,0.005)),uFrameWeight);
        heightValueIntNeigbour2 = mix(texture2D(thisHeightFrame,vUv+vec2(0.005,0.005)),texture2D(nextHeightFrame,vUv+vec2(0.005,0.005)),uFrameWeight);

        float heightDisplacement =  ( heightValueInt.r - 0.5 ) * uHeightDisplacement ;
        float heightDisplacementNeigbour1 =  ( heightValueIntNeigbour1.r - 0.5 ) * uHeightDisplacement ;
        float heightDisplacementNeigbour2 =  ( heightValueIntNeigbour2.r - 0.5 ) * uHeightDisplacement ;

        vec3 displacedPosition = position;
        displacedPosition.z += heightDisplacement - 0.002;

        float offset = 4.0 / 96.0 / 2.0;
        vec3 tangent = orthogonal(normal);
        vec3 bitangent = normalize(cross(normal, tangent));
        vec3 neighbour1 = position + tangent * offset;
        vec3 neighbour2 = position + bitangent * offset;
        vec3 displacedNeighbour1 = neighbour1 + normal * heightDisplacementNeigbour1;
        vec3 displacedNeighbour2 = neighbour2 + normal * heightDisplacementNeigbour2;
  
        // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
        vec3 displacedTangent = displacedNeighbour1 - displacedPosition;
        vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;
  
        // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
        vec3 displacedNormal = normalize(cross(displacedTangent, displacedBitangent));

        vec2 angles = M_PI * vec2(2. * uv.x, uv.y - 1.);
 //       vec3 sphPos = anglesToSphereCoord(angles, 1.0 + heightDisplacement - 0.002 );

        vec3 sphPos = anglesToSphereCoord(angles, 1.0 + heightDisplacement - 0.002 );


        vec3 wrapPos = mix(displacedPosition, sphPos, uSphereWrapAmount);

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
    fragmentShader: monkeyPatch(ShaderChunk.meshlambert_frag, {
      header: `
        uniform float uOpacitySurface;
        uniform float uFrameWeight;
        uniform float uCoastlineThreshold;
        uniform float uPFTsWeight;
        uniform float uAllowVegetation;
        uniform float uDarkerOcean;

        uniform sampler2D thisPFT1Frame;
        uniform sampler2D nextPFT1Frame;
        uniform sampler2D thisPFT2Frame;
        uniform sampler2D nextPFT2Frame;
        uniform sampler2D thisHeightFrame;
        uniform sampler2D nextHeightFrame;
        uniform sampler2D colorMap;
        uniform sampler2D grassTexture;
        uniform sampler2D sandTexture;
        uniform sampler2D shrubTexture;
        uniform sampler2D bltTexture;
        uniform sampler2D nltTexture;
        uniform sampler2D snowTexture;

        uniform bool uModifyCoastline;
        uniform bool uCoastlineModHighlight;
        uniform bool uShowLandIce;

        varying vec2 vUv;

        // convert float to color via colormap
        vec4 applyColormap(float t, sampler2D colormap){
          return(texture2D(colormap,vec2(t,0.5)));
        }

        // remap color range
        float remap(float value, float inMin, float inMax, float outMin, float outMax) {
    
            return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
    
        }

      `,
      // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
      main: `

      `,

        'vec4 diffuseColor = vec4( diffuse, opacity );':`
          //vec4 diffuseColor = vec4( vec3(0.0, 0.9, 0.3), opacity );

          // // standard bilinear interpolation
          vec4 pft1ValueInt = mix(texture2D(thisPFT1Frame,vUv),texture2D(nextPFT1Frame,vUv),uFrameWeight);
          vec4 pft2ValueInt = mix(texture2D(thisPFT2Frame,vUv),texture2D(nextPFT2Frame,vUv),uFrameWeight);

          vec4 heightValueInt = mix(texture2D(thisHeightFrame,vUv),texture2D(nextHeightFrame,vUv),uFrameWeight);

          // // convert height value to color
          // float baseValueExpanded = remap( heightValueInt.r, 0.0, 1.0, -6000.0, 6000.0 );
          // float baseValueRemapped = remap( baseValueExpanded, -5500., 5500., 0.0, 1.0 );
          vec4 heightColor = applyColormap( heightValueInt.r, colorMap );

          vec4 diffuseColor;

          // always use bathymetry color for ocean
          if (heightValueInt.r < 0.5) {

            float iceWeight = pft2ValueInt.b;
            vec4 iceColor = texture2D( snowTexture, vUv * 20.0 ) * iceWeight;

            diffuseColor = mix(heightColor * ( 1. - uDarkerOcean * 0.25), iceColor, iceWeight );

          } else {

            // get vegetation PFT colors

            float bltWeight = pft1ValueInt.r;
            float nltWeight = pft1ValueInt.g;
            float shrWeight = pft1ValueInt.b;

            float grsWeight = pft2ValueInt.r;
            float barWeight = pft2ValueInt.g;
            float iceWeight = pft2ValueInt.b;

            vec4 bltColor = texture2D( bltTexture, vUv * 10.0 ) * bltWeight;
            vec4 nltColor = texture2D( nltTexture, vUv * 10.0) * nltWeight;
            vec4 shrColor = texture2D( shrubTexture, vUv * 10.0 ) * shrWeight;

            vec4 grsColor = texture2D( grassTexture, vUv * 40.0 ) * grsWeight;
            vec4 barColor = texture2D( sandTexture, vUv * 20.0) * barWeight;
            vec4 iceColor = texture2D( snowTexture, vUv * 10.0 ) * iceWeight;

            float missingWeight = 1.0 - ( bltWeight + nltWeight + shrWeight + grsWeight + barWeight + iceWeight) ;
            vec4 missingColor = heightColor * missingWeight;

            vec4 pftColor = bltColor + nltColor + shrColor + grsColor + barColor + iceColor + missingColor;
 //           vec4 pftColor = bltColor + nltColor + shrColor + grsColor + barColor + iceColor;

            vec4 topoColor = mix(heightColor, iceColor, iceWeight );

            diffuseColor = mix(topoColor, pftColor, uPFTsWeight * uAllowVegetation);
            

          }

          diffuseColor.a = uOpacitySurface;

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

    extensions: {
      derivatives: true,
    },

    defines: {
      STANDARD: '',
      PHYSICAL: '',
    },


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
  //surface.position.set(0.,0.,-0.001)

  surface.tickEachFrame = (currentTime) => { 

    if (currentTime <= -300.0) {

      surface.material.uniforms.uAllowVegetation.value = 0.0

    } else if (currentTime <= -200.0) {

      surface.material.uniforms.uAllowVegetation.value = ( currentTime + 300. ) / 100.

    }//  else {

    //   surface.material.uniforms.uAllowVegetation.value = 1.0

    // }

  }

  // define function to update texture if keyFrame changes
  surface.tick = (frame, direction) => { 


    if(direction == 'backInTime') {
     //console.log('backward to '+frame)

     surface.material.uniforms.nextPFT1Frame.value = surface.material.uniforms.thisPFT1Frame.value
     const thisPFT1Frame = textureFromCanvas(surfacePFT1Image, cmapID.fillMethod, frame)
     surface.material.uniforms.thisPFT1Frame.value = thisPFT1Frame

      surface.material.uniforms.nextPFT2Frame.value = surface.material.uniforms.thisPFT2Frame.value
      const thisPFT2Frame = textureFromCanvas(surfacePFT2Image, cmapID.fillMethod, frame)
      surface.material.uniforms.thisPFT2Frame.value = thisPFT2Frame

      surface.material.uniforms.nextHeightFrame.value = surface.material.uniforms.thisHeightFrame.value
      const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame)
      surface.material.uniforms.thisHeightFrame.value = thisHeightFrame

    } else if(direction == 'forwardInTime') {
     //console.log('forward to '+frame)

      surface.material.uniforms.thisPFT1Frame.value = surface.material.uniforms.nextPFT1Frame.value
      const nextPFT1Frame = textureFromCanvas(surfacePFT1Image, cmapID.fillMethod, frame + 1)
      surface.material.uniforms.nextPFT1Frame.value = nextPFT1Frame

      surface.material.uniforms.thisPFT2Frame.value = surface.material.uniforms.nextPFT2Frame.value
      const nextPFT2Frame = textureFromCanvas(surfacePFT2Image, cmapID.fillMethod, frame + 1)
      surface.material.uniforms.nextPFT2Frame.value = nextPFT2Frame

      surface.material.uniforms.thisHeightFrame.value = surface.material.uniforms.nextHeightFrame.value
      const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame + 1)
      surface.material.uniforms.nextHeightFrame.value = nextHeightFrame

    }
  }

  // define function to change texture filtering
  surface.changeFilter = (frame, oldFilter, newFilter) => { 

    surface.material.uniforms.thisPFT1Frame.value = textureFromCanvas(surfacePFT1Image, oldFilter, frame)
    surface.material.uniforms.nextPFT1Frame.value = textureFromCanvas(surfacePFT1Image, newFilter, frame)

    surface.material.uniforms.thisPFT2Frame.value = textureFromCanvas(surfacePFT2Image, oldFilter, frame)
    surface.material.uniforms.nextPFT2Frame.value = textureFromCanvas(surfacePFT2Image, newFilter, frame)

    surface.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, oldFilter, frame)
    surface.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, newFilter, frame)

 //   surface.material.uniforms.uFrameWeight.value = 0.0

  }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    surface.resetTextures = async (frame, filter) => { 
    
      surface.material.uniforms.thisPFT1Frame.value = textureFromCanvas(surfacePFT1Image, filter, frame)
      surface.material.uniforms.thisPFT2Frame.value = textureFromCanvas(surfacePFT2Image, filter, frame)
      surface.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

  //    surface.material.uniforms.uFrameWeight.value = 1.0
  
    }

    surface.setGeometryResolution = () => { 
    
      surface.geometry.dispose()
      surface.geometry = new PlaneBufferGeometry(4, 2, numLongitude * modelConfig.gridMultiplier, numLatitude * modelConfig.gridMultiplier);
      
    }


    const imageLoader = new ImageLoader()
    const textureLoader = new TextureLoader()
    let surfaceHeightTexture

    surface.changeHeightData = async (frame, filter, heightData) => { 

      console.log('change height')
  
      surface.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

      let uNewHeightGridXOffsetSurface
      if (heightData === 'Valdes et al. (2021)') {

        //shaderUniforms.uNewHeightGridXOffset = 0.0
        uNewHeightGridXOffsetSurface = 0.00725
        numLongitude = 96
        numLatitude = 73    
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_height.' + modelConfig.timeRange + '.png')

        gsap.to(surface.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffsetSurface })

      } else if (heightData === 'Scotese & Wright (1.0 deg)') {

        uNewHeightGridXOffsetSurface = 0.00139
        //uNewHeightGridXOffsetSurface = 0.0

        numLongitude = 360
        numLatitude = 181
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.png')

        gsap.to(surface.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffsetSurface })

    } else if (heightData === 'Scotese & Wright (0.25 deg)') {

      uNewHeightGridXOffsetSurface = 0.00035
      //uNewHeightGridXOffsetSurface = 0.0

      numLongitude = 1440
      numLatitude = 720
      surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.025.png')

      gsap.to(surface.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffsetSurface })

  } 

      surface.setGeometryResolution()

      if (modelConfig.heightData === 'EXPERIMENTAL: Scotese & Wright (1.0 deg) 0.1x0.1 degree') {

        surface.material.uniforms.nextHeightFrame.value = surfaceHeightTexture

      } else {

        surface.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

      }

      surface.material.uniforms.nextPFT1Frame.value = surface.material.uniforms.thisPFT1Frame.value
      surface.material.uniforms.nextPFT2Frame.value = surface.material.uniforms.thisPFT2Frame.value

    }

  return surface;
}

  // dummy sphere geometry as raycasting target to retrieve cursor latitude/longitude
function createDummySphere() {
  const geometry = new SphereBufferGeometry(1, 16, 16, - Math.PI * 0.5 )
  const material = new MeshBasicMaterial( { transparent: true, opacity: 0.0 } );
  const surfaceDummySphere = new Mesh( geometry, material );
  surfaceDummySphere.visible = false
  
  return surfaceDummySphere
}
export { createSurface, createDummySphere, uOpacity };