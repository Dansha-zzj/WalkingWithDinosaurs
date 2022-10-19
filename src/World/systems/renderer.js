import { WebGLRenderer } from 'three';

function createRenderer() {
  const renderer = new WebGLRenderer({ 
//    antialias: false,
    antialias: true,
    alpha:true
  });

  //renderer.physicallyCorrectLights = true;

  //renderer.gammaOutput = true


  return renderer;
}

export { createRenderer };
