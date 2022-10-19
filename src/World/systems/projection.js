import gsap from 'gsap'
import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install( { THREE: THREE } );

function toggleProjectionWrap(controls, camera, region, shaderUniforms) {

  if (shaderUniforms.uSphereWrapAmount.value < 0.5) {

    gsap.to(shaderUniforms.uSphereWrapAmount, { duration: 3, ease: 'power1', delay: 0, value: 1 })

    controls.minDistance = 3.0
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI 
    controls.minAzimuthAngle = - Infinity
    controls.maxAzimuthAngle = Infinity

    controls.dollyToCursor = false

    if (region === 'equator') {
  
      var lat = 10.
      var lon = -20.
      var newTheta = lon * THREE.MathUtils.DEG2RAD
      var newPhi = -1. * ( ( lat - 90. ) * THREE.MathUtils.DEG2RAD )

      // slower/smoother camera transition
      controls.dampingFactor = 0.005
      controls.reset(true)

      setTimeout(function(){
        controls.rotateTo( newTheta, newPhi, true)
        controls.zoomTo( 1.2, true )
    }, 1000);

      // set camera smoothing back to normal after transition
      setTimeout(function(){
        controls.dampingFactor = 0.015
      }, 8000);

  }

    // manually set globe controls
    controls.mouseButtons = {
      left: CameraControls.ACTION.ROTATE,
      middle: CameraControls.ACTION.DOLLY,
      wheel: CameraControls.ACTION.DOLLY,
      right: CameraControls.ACTION.TRUCK
   }

    controls.touches = {
      one: CameraControls.ACTION.TOUCH_ROTATE,
      two: CameraControls.ACTION.DOLLY,
      three: CameraControls.ACTION.TOUCH_DOLLY_TRUCK,
    }

  } else {

    controls.minDistance = 1.0
    controls.minPolarAngle =  Math.PI *  0.5
    controls.maxPolarAngle = Math.PI *  1.0
    controls.minAzimuthAngle = 0
    controls.maxAzimuthAngle = 0

    gsap.to(shaderUniforms.uSphereWrapAmount, { duration: 3, ease: 'power1', delay: 0, value: 0 })

    controls.maxPolarAngle = Math.PI *  1.0

    controls.dampingFactor = 0.005
    controls.reset(true)

    // set camera smoothing back to normal after transition
    setTimeout(function(){
      controls.dampingFactor = 0.015
    }, 5000);

    controls.dollyToCursor = true


    // set map controls
    controls.mouseButtons = {
      left: CameraControls.ACTION.TRUCK,
      middle: CameraControls.ACTION.DOLLY,
      wheel: CameraControls.ACTION.DOLLY,
      right: CameraControls.ACTION.ROTATE
    }
  
    controls.touches = {
      one: CameraControls.ACTION.TOUCH_TRUCK,
      two: CameraControls.ACTION.DOLLY,
      three: CameraControls.ACTION.TOUCH_ROTATE,
    }

  }

}

export { toggleProjectionWrap };
