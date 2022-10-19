// import { OrbitControls, MapControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
//import { MOUSE, TOUCH } from 'three'

import * as THREE from 'three';
import CameraControls from 'camera-controls';

CameraControls.install( { THREE: THREE } );

function createControls(camera, canvas, projection, shaderUniforms, modelConfig, cameraParameters) {
 // const controls = new OrbitControls(camera, canvas);
const controls = new CameraControls(camera, canvas);

//  const controls = new MapControls(camera, canvas);

//controls.enableDamping = true

controls.enabled = true

if (modelConfig.project == "CMIP6") {

  controls.maxDistance = 20;
  controls.dampingFactor = 0.0

} else {

  controls.maxDistance = 30;

}

controls.minDistance = 3.0;
controls.draggingDampingFactor = .1
controls.dampingFactor = .015;

if (projection === "plane") {

  shaderUniforms.uSphereWrapAmount.value = 0.0

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

  // Limit axes for initial plane view
  controls.minPolarAngle =  Math.PI *  0.5
  controls.maxPolarAngle = Math.PI *  1.0
  controls.minAzimuthAngle = 0
  controls.maxAzimuthAngle = 0

  controls.dollyToCursor = true

} else if (projection === "sphere") {

  shaderUniforms.uSphereWrapAmount.value = 1.0

  var projectionButton = document.querySelector("#toggleProjection-button")

  if(projectionButton){

    projectionButton.style.color = "white"

  }

  controls.minPolarAngle = 0
  controls.maxPolarAngle = Math.PI 
  controls.minAzimuthAngle = - Infinity
  controls.maxAzimuthAngle = Infinity
  
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

}

  // forward controls.update to our custom .tick method
  controls.tickEachFrame = (currentTime, cameraParameters, delta) => {
    
    controls.update( delta );
    
    // auto rotate globe
    if (cameraParameters.autoRotate) {

      controls.azimuthAngle -= cameraParameters.autoRotateSpeed * delta 

    }

    if ( cameraParameters.FPCenabled === false ) {
      
      controls.update( delta );

    }

  }

  // pause auto rotation if user drags globe
  controls.addEventListener( 'controlstart', () => {

    if (cameraParameters.autoRotate) {

      cameraParameters.autoRotate = false
      cameraParameters.autoRotateState = true;

    }
  
  } );
  controls.addEventListener( 'controlend', () => {
  
    cameraParameters.autoRotate = cameraParameters.autoRotateState;
    cameraParameters.autoRotateState = false
  
  } );

  return controls;
}

function createFirstPersonControls(camera, canvas) {

  const controlsFP = new PointerLockControls(camera, canvas); 

  // forward controls.update to our custom .tick method
  controlsFP.tickEachFrame = (currentTime, cameraParameters, delta) => {
    
    if ( cameraParameters.FPCenabled === true ) {

      // form https://github.com/mrdoob/three.js/blob/master/examples/misc_controls_pointerlock.html
      cameraParameters.directionFPC.z = Number( cameraParameters.moveForward ) - Number( cameraParameters.moveBackward );
      cameraParameters.directionFPC.x = Number( cameraParameters.moveRight ) - Number( cameraParameters.moveLeft );
      cameraParameters.directionFPC.y = Number( cameraParameters.moveUp ) - Number( cameraParameters.moveDown );
      cameraParameters.directionFPC.normalize(); // this ensures consistent movements in all directions

      // movement without intertia
      const speed = 0.1 
      if ( cameraParameters.moveLeft || cameraParameters.moveRight ) controlsFP.moveRight( cameraParameters.directionFPC.x * speed * delta );
      if ( cameraParameters.moveForward || cameraParameters.moveBackward ) controlsFP.moveForward( cameraParameters.directionFPC.z * speed * delta * 1 );
  
      if ( cameraParameters.moveUp || cameraParameters.moveDown ) controlsFP.getObject().position.y += ( cameraParameters.directionFPC.y * speed * delta * 1 ); // new behavior
  
    }

  }

  return controlsFP;

 }


function spinGlobe(cameraParameters) {

  cameraParameters.autoRotate = !cameraParameters.autoRotate; 

}

export { createControls, createFirstPersonControls, spinGlobe };
