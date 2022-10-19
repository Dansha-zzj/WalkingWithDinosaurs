import { Color, TextureLoader, ImageLoader, PlaneBufferGeometry, SphereGeometry, ShaderMaterial, MeshDepthMaterial, MeshBasicMaterial, MeshStandardMaterial, MeshLambertMaterial, Mesh, UniformsUtils, UniformsLib, ShaderLib, ShaderChunk, RepeatWrapping, Vector2, LinearFilter, NearestFilter, MeshPhongMaterial } from 'three';
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'
import { modelConfig, cmapID, timeControl } from '../systems/initialModelConfig.js'
import { createColormapTexture } from '../systems/colormapTexture.js'

let uOpacity = {type: 'f', value: 1};

async function createCustomSurfaceCOP26(tasDataImage, siconcDataImage, modelConfig, shaderUniforms) {
  const loader = new TextureLoader();

  let data = {

    thisTASFrame: {value: textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.currentTimeFrame) },
    nextTASFrame: {value: textureFromCanvas(tasDataImage, cmapID.fillMethod, timeControl.nextTimeFrame) },
    thisICEFrame: {value: textureFromCanvas(siconcDataImage, cmapID.fillMethod, timeControl.currentTimeFrame) },
    nextICEFrame: {value: textureFromCanvas(siconcDataImage, cmapID.fillMethod, timeControl.nextTimeFrame) },

  }

  const colorMapTAS = createColormapTexture('COP26v2')

  const surfaceTexture = await loader.loadAsync('/textures/land_shallow_topo_2k_MQ.jpg')
  const coastline = await loader.loadAsync('/textures/NaturalEarthCoastline2.jpg')

  const surfaceHeightTexture = await loader.loadAsync('/textures/gebco_08_rev_elev_2k_HQ.jpg')

  const geometry = new SphereGeometry(1.0, 256, 256);

  const material = new MeshPhongMaterial({
    
    map: surfaceTexture,
    displacementMap: surfaceHeightTexture,
    displacementScale:  shaderUniforms.uHeightDisplacement.value,
    bumpMap: surfaceHeightTexture,
    bumpScale:   0.2,
  //  specularMap: specularMap,
//    specular: new Color(0x111111),
    color: new Color(0x00000),
    shininess: 0,
    transparent: true,
    depthWrite: true,
  })

  material.userData.uFrameWeight = shaderUniforms.uFrameWeight
  material.userData.uOpacityTemp = shaderUniforms.uOpacityTemp
  material.userData.uOpacityIce = shaderUniforms.uOpacityIce
  material.userData.uOpacitySurface = shaderUniforms.uOpacitySurface

  material.onBeforeCompile = shader => {

     //pass this input by reference
    shader.uniforms.uFrameWeight = material.userData.uFrameWeight
    shader.uniforms.uOpacityTemp = material.userData.uOpacityTemp
    shader.uniforms.uOpacityIce = material.userData.uOpacityIce
    shader.uniforms.uOpacitySurface = material.userData.uOpacitySurface
    shader.uniforms.thisTASFrame = data.thisTASFrame 
    shader.uniforms.nextTASFrame = data.nextTASFrame 
    shader.uniforms.thisIceFrame = data.thisICEFrame
    shader.uniforms.nextIceFrame = data.nextICEFrame 
    shader.uniforms.colorMapTAS = {value: colorMapTAS } 
    shader.uniforms.coastline = {value: coastline } 

    //add uniforms
    shader.fragmentShader = 
      'uniform float uFrameWeight; \n' + 
      'uniform float uOpacityTemp; \n' + 
      'uniform float uOpacityIce; \n' + 
      'uniform float uOpacitySurface; \n' + 
      'uniform sampler2D thisTASFrame; \n' +  
      'uniform sampler2D nextTASFrame; \n' +  
      'uniform sampler2D thisIceFrame; \n' +  
      'uniform sampler2D nextIceFrame; \n' +  
      'uniform sampler2D colorMapTAS; \n' + 
      'uniform sampler2D coastline; \n' + 
      'vec4 applyColormap(float t, sampler2D colormap){return(texture2D(colormap,vec2(t,0.5)));} \n' + 
      'float remap(float value, float inMin, float inMax, float outMin, float outMax) {return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);} \n' + 
      'vec4 cubic(float v) {vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;vec4 s = n * n * n;float x = s.x;float y = s.y - 4.0 * s.x;float z = s.z - 4.0 * s.y + 6.0 * s.x;float w = 6.0 - x - y - z;return vec4(x, y, z, w) * (1.0/6.0);} \n' +
      'vec4 textureBicubic(sampler2D sampler, vec2 texCoords) {vec2 texSize = vec2(180.0, 90.0);vec2 invTexSize = 1.0 / texSize;texCoords = texCoords * texSize - 0.5;vec2 fxy = fract(texCoords);texCoords -= fxy;vec4 xcubic = cubic(fxy.x);vec4 ycubic = cubic(fxy.y);vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;offset *= invTexSize.xxyy; vec4 sample0 = texture2D(sampler, offset.xz);vec4 sample1 = texture2D(sampler, offset.yz);vec4 sample2 = texture2D(sampler, offset.xw);vec4 sample3 = texture2D(sampler, offset.yw);float sx = s.x / (s.x + s.y);float sy = s.z / (s.z + s.w);return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);} \n' +

      shader.fragmentShader

    //add temperature to surface texture
    shader.fragmentShader = 
      shader.fragmentShader.replace(
        '#include <map_fragment>', 
        'vec4 surfaceColor = texture2D( map, vUv ); \n' + 
 //       'vec4 tasValueInt = mix(texture2D(thisTASFrame,vUv),texture2D(nextTASFrame,vUv),uFrameWeight); \n' + 
        'vec4 tasValueInt = mix(textureBicubic(thisTASFrame,vUv),textureBicubic(nextTASFrame,vUv),uFrameWeight); \n' + 
        'vec4 iceValueInt = mix(texture2D(thisIceFrame,vUv),texture2D(nextIceFrame,vUv),uFrameWeight); \n' + 
        'iceValueInt.r *= uOpacityIce; \n' + 
        'if ( iceValueInt.r <= 0.15 ) {iceValueInt.r = 0.0;} \n' + 
        'else {iceValueInt.r = ( iceValueInt.r - 0.15 ) / ( .8 - 0.15 );} \n' + 
        'float tasValueExpanded = remap( tasValueInt.r, 0.0, 1.0, -2., 18.0 ); \n' + 
        'float tasValueRemapped = remap( tasValueExpanded, 0.0, 8.0, 0.0, 1.0 ); \n' + 
        'vec4 tasColor = applyColormap( tasValueRemapped, colorMapTAS ); \n' + 
        'float opacityMaskWeight; \n' + 
        'if ( tasValueRemapped <= 1./8. ) {opacityMaskWeight = 0.0;} \n' + 
        'else if ( tasValueRemapped <= 2./8. ) {opacityMaskWeight = ( tasValueRemapped - 1./8.  ) / ( 2./8.  - 1./8.  );} \n' + 
        'else {opacityMaskWeight = 1.0;} \n' + 

 //       'opacityMaskWeight = mix (1., opacityMaskWeight, 1.0); \n' + 
 //       'surfaceColor = mix(surfaceColor, vec4(1.,1.,1.,1.), iceValueInt.r); \n' + 
 //       'vec4 tasColorIce = tasColor * vec4(.5,.5,.5,.5); \n' + 
//        'tasColor = mix(tasColor, tasColorIce, iceValueInt.r); \n' + 
        'tasColor.a = 1. - iceValueInt.r; \n' + 
        'surfaceColor = mix(tasColor, surfaceColor, uOpacitySurface); \n' + 
        'vec4 coast = texture2D(coastline,vUv);; \n' + 
        'if ( iceValueInt.r <= 0.15 ) {diffuseColor = mix(surfaceColor, tasColor, opacityMaskWeight * uOpacityTemp );} \n' + 
        'else {diffuseColor = surfaceColor;} \n' + 
//        'vec4 diffuseColorPale = diffuseColor; \n' + 
//        'diffuseColorPale.a = 0.5; \n' + 
//        'vec4 diffuseColorPale.a = mix(diffuseColor, tasColor, opacityMaskWeight * 1.0); \n' + 
        'vec4 iceColor = vec4(.9, .9, .9, 1.); \n' + 
        'diffuseColor = mix(diffuseColor, iceColor, iceValueInt.r); \n' + 
        'diffuseColor = mix(vec4(0.,0.,0.,1.),diffuseColor,coast.r);;'

        ) 
  }


  const surface = new Mesh( geometry, material );

  // define function to update texture if keyFrame changes
  surface.tick = (frame, direction) => { 


   if(direction == 'backInTime') {
     //console.log('backward to '+frame)

      data.nextTASFrame.value = data.thisTASFrame.value
      data.thisTASFrame.value = textureFromCanvas(tasDataImage, cmapID.fillMethod, frame)

      data.nextICEFrame.value = data.thisICEFrame.value
      data.thisICEFrame.value = textureFromCanvas(siconcDataImage, cmapID.fillMethod, frame)
    

    } else if(direction == 'forwardInTime') {
     //console.log('forward to '+frame)

      data.thisTASFrame.value = data.nextTASFrame.value
      data.nextTASFrame.value = textureFromCanvas(tasDataImage, cmapID.fillMethod, frame + 1)

      data.thisICEFrame.value = data.nextICEFrame.value
      data.nextICEFrame.value = textureFromCanvas(siconcDataImage, cmapID.fillMethod, frame + 1)
    } 

  }

  return surface;
}

export { createCustomSurfaceCOP26 };
