import { PerspectiveCamera } from 'three';
import gsap from 'gsap'

function createCamera(container, modelConfig) {

//  const camera = new PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 50);
  const camera = new PerspectiveCamera(10, container.clientWidth / container.clientHeight, 0.1, 100);

  camera.position.set(0.0, 0.0, 14.5);

//  camera.position.set(0.0, -9.0, 9.0);

  camera.toggleStartiew = (duration) => {

    gsap.to( camera.position, {
  
        duration: duration,  
        x: 0,
        // y: -9.0,
        // z: 9.0,
        y: -6.913901299553367,
        z: 10.686344970102464,
        onUpdate: function () {
            camera.lookAt( 0,0,0 );
  
        }
  
    } );

  }

  camera.toggleStartiewCMIP = (duration) => {

    gsap.to( camera.position, {
  
        duration: duration,  
        x: 9.21,
        // y: -9.0,
        // z: 9.0,
        y: 6.74,
        z: -3.72,
        onUpdate: function () {
            camera.lookAt( 0,0,0 );
  
        }
  
    } );

  }

  camera.toggleEndView = (duration) => {

    gsap.to( camera.position, {
  
        duration: 3,  
        x: -1.6693651134794536,
        y: 5.491915141658337,
        z: 7.282367368151772,
  
    } );

  }

  return camera;

}

export { createCamera };
