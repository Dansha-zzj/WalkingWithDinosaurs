import { DirectionalLight, PointLight, HemisphereLight, AmbientLight } from 'three';

// function createLights() {
//   const ambientLight = new HemisphereLight(
//     'white',
//     'darkslategrey',
//     1.05,
//   );
//   ambientLight.position.set(0, 1, 0);

//   const mainLight = new DirectionalLight('white', .9);
//   mainLight.position.set(10, 10, 10);
// //  mainLight.target.position.set(0, 0, 20);

//   return { ambientLight, mainLight };

//  }

function createLights(intensityAmbient, intensitySpot, modelConfig) {

var ambientLight, mainLight

  if (modelConfig.project == "CMIP6") {

    ambientLight = new AmbientLight(0xffffff, intensityAmbient)

    // ambientLight = new HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    // ambientLight.color.setHSL( 0.6, 1, 0.6 );
    // ambientLight.groundColor.setHSL( 0.095, 1, 0.75 );
    // ambientLight.position.set( 0, 50, 0 );

    mainLight = new DirectionalLight(0xffffff, intensitySpot);
    mainLight.position.set(0.5,0,1);

  } else {

    ambientLight = new AmbientLight(0x333333, intensityAmbient)

    mainLight = new DirectionalLight(0xffffff, intensitySpot);
    mainLight.position.set(5,3,5);

  }

  return { ambientLight, mainLight };

}

export { createLights };
