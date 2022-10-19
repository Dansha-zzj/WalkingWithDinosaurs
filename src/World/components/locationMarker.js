import { SphereGeometry, MeshLambertMaterial, Mesh, Color  } from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { cmapID, timeControl } from '../systems/initialModelConfig.js'
import { textureFromCanvas } from '../canvas/canvasDataTexture.js'

function createLocationMarker(lat, lon, modernLon, modernLat, rotationsDataImage, shaderUniforms, color, animate, markerRotationFlag ) {

  const thisRotationsFrame = textureFromCanvas(rotationsDataImage, cmapID.fillMethod, timeControl.currentTimeFrame)
  const nextRotationsFrame = textureFromCanvas(rotationsDataImage, cmapID.fillMethod, timeControl.nextTimeFrame)

  const geometry = new SphereGeometry(0.04, 32, 16);

  const markerColor = new Color( color );

  const material = new CustomShaderMaterial(
    MeshLambertMaterial,    // baseMaterial
      /* fragment shader*/ `
      uniform vec3 uColor;
      uniform float uOpacity;

      void main()	{

        csm_DiffuseColor = vec4(uColor, uOpacity);
      
      }`,           // fragmentShader
      /* vertex shader */ ` 
      #define M_PI 3.14159265
          
      uniform float uSphereWrapAmount;
      uniform float uFrameWeight;
      uniform bool uRotateMarker;
      uniform float uLat;
      uniform float uLon; 
      uniform float uModernLat;
      uniform float uModernLon; 
      uniform float uSize; 
      uniform float uMarkerBuildTime; 
      uniform bool uMarkerAnimate; 
      uniform sampler2D thisRotationsFrame;
      uniform sampler2D nextRotationsFrame;

      // remap color range
      float remap(float value, float inMin, float inMax, float outMin, float outMax) {
  
          return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
  
      }

      void main()	{

        float lat;
        float lon;

        bool rotateMarker = true;

        if (uRotateMarker) {

          // convert lat/lon position to UV texture coordinate [0,1]
          vec2 vc2D  = vec2 ( uModernLon / 360. + 0.5 + ( 1. / 181. / 2.0 ) ,  uModernLat / 180. + 0.5  );

          //bilinear interpolation
          vec4 rotationLookup = mix(texture2D(thisRotationsFrame,vc2D),texture2D(nextRotationsFrame,vc2D),uFrameWeight);

          lat = remap( rotationLookup.x, 0.0, 1.0, -90.0, 90.0 );
          lon = remap( rotationLookup.y, 0.0, 1.0, -180.0, 180.0 );

        } else {

          lat = uLat;
          lon = uLon;

        }

        // calculate plane position
        vec3 posPlane;
        posPlane.x = lon / 180. * 2.;
        posPlane.y = lat / 90. * 1.;

        // calculate sphere position
        vec3 posSphere;
        float theta;
        float phi;
        float r;

        if (uMarkerAnimate) {

          r = 1.0 + uMarkerBuildTime;
          posPlane.z = uMarkerBuildTime;

        } else {

          r = 1.0;
          posPlane.z = 0.;

        }

        theta = 2. * M_PI * (posPlane.x / 4. + 0.5);
        phi = M_PI * (posPlane.y / 2. + 0.5 - 1.0);

        float sinPhiRadius = sin( phi ) * r;
        posSphere.x = sinPhiRadius * sin(theta);
        posSphere.y = r * cos(phi);
        posSphere.z = sinPhiRadius * cos(theta);

        posPlane += position * uSize;
        posSphere += position * uSize;

        // mix plane and sphere position 
        csm_Position = mix(posPlane, posSphere, uSphereWrapAmount);
        //csm_Position = position;

      }`,
      /* uniforms */
      {
        uSphereWrapAmount: shaderUniforms.uSphereWrapAmount,
        uFrameWeight: shaderUniforms.uFrameWeight,
        uLat: { value: lat },
        uLon: { value: lon },
        uModernLat: { value: modernLat },
        uModernLon: { value: modernLon },
        thisRotationsFrame : {value: thisRotationsFrame },
        nextRotationsFrame : {value: nextRotationsFrame },
        uColor: { value: markerColor },
        uOpacity: { value: 1.0 },
        uSize: { value: 1.0 },
        uRotateMarker: { value: markerRotationFlag },
        uMarkerAnimate: { value: animate },
        uMarkerBuildTime: shaderUniforms.uMarkerBuildTime,
        uValidAgeMin: { value: -999 },
        uValidAgeMax: { value: -999 }
      },
      {
        transparent: true
      }
  )

  const marker = new Mesh( geometry, material );

  marker.renderOrder = 1
  marker.frustumCulled = false

  // define function to update texture if keyFrame changes
  marker.tickEachFrame = (currentTime) => { 

    // update marker size based on zoom level
    //marker.material.uniforms.uSize.value = 2. - shaderUniforms.uZoomWeight.value
    marker.material.uniforms.uSize.value = 1.3 - shaderUniforms.uZoomWeight.value * ( 0.9 + 0.1 * shaderUniforms.uSphereWrapAmount.value )

    // change marker opacity based on currentTime 

    // skip dummy marker
    if ( marker.material.uniforms.uValidAgeMax.value != -999 ) {

      var timeCutoff = 6.

      if ( (currentTime < marker.material.uniforms.uValidAgeMax.value - timeCutoff) ||  ( currentTime > marker.material.uniforms.uValidAgeMin.value + timeCutoff ) ) {

        marker.material.visible = false

      } else {

        marker.material.visible = true
        marker.material.uniforms.uOpacity.value = 1.0

        //fade out marker close to age boundaries
        let timeDelta

        // always gradually fade out markers for undefined times
        
        // case 1: fixed markers fade out symmetrically around defined age
        if (marker.material.uniforms.uValidAgeMax.value == marker.material.uniforms.uValidAgeMin.value) {

          timeDelta = Math.abs(marker.material.uniforms.uValidAgeMax.value - currentTime)

          if( timeDelta < timeCutoff ) {
      
            marker.material.uniforms.uOpacity.value = 1. - timeDelta / timeCutoff
      
          }

        // case 2: rotating markers fade out close to AgeMax
        } else {

            var timeDeltaMax = Math.abs(marker.material.uniforms.uValidAgeMax.value - timeCutoff - currentTime)

            if( timeDeltaMax < timeCutoff ) {
          
                marker.material.uniforms.uOpacity.value = timeDeltaMax / timeCutoff
          
              }

        }


      }
    }

    // var timeDelta = Math.abs(marker.material.uniforms.definedTime.value - currentTime)
    // var timeCutoff = 8.

    // if( timeDelta > timeCutoff ) {

    //   marker.material.visible = false

    // } else {

    //   marker.material.visible = true
    //   marker.material.uniforms.uOpacity.value = 1.0 - timeDelta / timeCutoff

    // }

  }

  // define function to update texture if keyFrame changes
  marker.tick = (frame, direction) => { 

    if(direction == 'backInTime') {

      marker.material.uniforms.nextRotationsFrame.value = marker.material.uniforms.thisRotationsFrame.value
      const thisRotationsFrame = textureFromCanvas(rotationsDataImage, cmapID.fillMethod, frame)
      marker.material.uniforms.thisRotationsFrame.value = thisRotationsFrame

    } else if(direction == 'forwardInTime') {

      marker.material.uniforms.thisRotationsFrame.value = marker.material.uniforms.nextRotationsFrame.value
      const nextRotationsFrame = textureFromCanvas(rotationsDataImage, cmapID.fillMethod, frame + 1)
      marker.material.uniforms.nextRotationsFrame.value = nextRotationsFrame

    }
  }

  marker.changeHeightData = async (frame, filter, heightData) => { 
    
    console.log('ignore marker ')

  }  

  // define function to change texture filtering
  marker.changeFilter = (frame, oldFilter, newFilter) => { 
    
    console.log('ignore marker ')

  }

  // define function to reset textures to rounded frame number after GSAP transition is complete
  marker.resetTextures = async (frame, filter) => { 

    console.log('ignore marker ')

  }

  return marker;

}

export { createLocationMarker };
