import { Mesh, InstancedBufferGeometry, InstancedBufferAttribute, Color, ImageLoader, Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createTreeGeometry } from './treeGeometry.js'
import { createTreeMaterial } from './treeMaterial.js'
import { cmapID, modelConfig, cameraParameters } from '../../systems/initialModelConfig.js'
import { textureFromCanvas } from '../../canvas/canvasDataTexture.js'
import gsap from 'gsap'

async function createTrees(modelConfig, model, numMeshes, surfaceHeightImage, surfacePFTImage, count, maxCount, biomeMultiplier, shaderUniforms ) {

  // load 3d model data
  const loader = new GLTFLoader();

  const [treeData] = await Promise.all([
    loader.loadAsync('/3dmodels/' + model ),
  ]);

  // create individual instanced geometries for leafs and stems
  const geometry3D = extractGeometry(treeData, model, 'leafs');

  var modelLeafs, modelStems, meshLeafs, meshStems
  
  //const geometry = createTreeGeometry(pineLeaf.geometry, count, maxCount)
  const geometryLeafs = createTreeGeometry(geometry3D, count * biomeMultiplier, maxCount * biomeMultiplier)

  var colorLeafes, colorStems, pftChannel

  if ( (model == 'pine_tree_1/scene.gltf' ) || (model == 'nlt/Tree 2601_nlt.glb' ) ) {
    colorLeafes = new Color( '#0B700E' )
    colorStems = new Color( '#A05900' )
    pftChannel = 2.
  } else if ( (model == 'arbol-low-poly-reduced/scene2.glb') || (model == 'blt/Tree 2601_blt.glb') ) {
    colorLeafes = new Color( '#58F113' )
    colorStems = new Color( '#F99516' )
    pftChannel = 1.
  } else if (model == 'bush_1_-_low_poly/scene.gltf') {
    colorLeafes = new Color( '#3C7E07' )
    pftChannel = 3.  
  } else if (model == 'bush/scene.gltf') {
    colorLeafes = new Color( '#3C7E07' )
    pftChannel = 3.  
  } else if ( (model == 'low_poly_grass_pack/grass.glb') || (model == 'grass_single/grass_single.glb') ) {
    colorLeafes = new Color( '#45c10b' )
    pftChannel = 1.  
  }

  const materialLeafs = createTreeMaterial(surfaceHeightImage, surfacePFTImage, colorLeafes, pftChannel, shaderUniforms)

  meshLeafs = new Mesh(geometryLeafs.geometry, materialLeafs.material)
  meshLeafs.scale.set(0.01, 0.01, 0.01);
  meshLeafs.rotation.set(Math.PI / 2., 0., 0.);
  meshLeafs.frustumCulled = false; // disable frustum culling

  if(numMeshes == 2) {

    //modelStems = model3D.children[1]

    const geometry3D = extractGeometry(treeData, model, 'stems');

    const geometryStems = new InstancedBufferGeometry();

    geometryStems.copy(geometry3D);
    geometryStems.setAttribute('positions', new InstancedBufferAttribute(new Float32Array(geometryLeafs.geometry.attributes.positions.array), 3 ));
    geometryStems.setAttribute('gridUV', new InstancedBufferAttribute(new Float32Array(geometryLeafs.geometry.attributes.gridUV.array), 2 ));
    geometryStems.setAttribute('quaternions', new InstancedBufferAttribute(new Float32Array(geometryLeafs.geometry.attributes.quaternions.array), 4 ));

    geometryStems.instanceCount = count * biomeMultiplier
    geometryStems.maxInstancedCount = maxCount * biomeMultiplier

    const materialStems = createTreeMaterial(surfaceHeightImage, surfacePFTImage, colorStems, pftChannel, shaderUniforms)
  
    meshStems = new Mesh(geometryStems, materialStems.material)
    meshStems.scale.set(0.01, 0.01, 0.01);

    meshStems.rotation.set(Math.PI / 2., 0., 0.);
    meshStems.frustumCulled = false; // disable frustum culling

  } 


  // method to dynamically update number of trees at each frame
  meshLeafs.tickEachFrame = (currentTime) => { 

    meshLeafs.geometry.instanceCount = shaderUniforms.uTreeCount.value * biomeMultiplier * shaderUniforms.uUserTreeScale.value;                   
    
    if (currentTime <= -300.0) {

      shaderUniforms.uAllowVegetation.value = 0.0

    } else if (currentTime <= -200.0) {

      shaderUniforms.uAllowVegetation.value = ( currentTime + 300. ) / 100.

    } 

  }

   // define method to update texture if keyFrame changes
   meshLeafs.tick = (frame, direction) => { 


    if(direction == 'backInTime') {
      //console.log('backward to '+frame)

      meshLeafs.material.uniforms.nextPFTFrame.value = meshLeafs.material.uniforms.thisPFTFrame.value
      const thisPFTFrame = textureFromCanvas(surfacePFTImage, cmapID.fillMethod, frame)
      meshLeafs.material.uniforms.thisPFTFrame.value = thisPFTFrame

      meshLeafs.material.uniforms.nextHeightFrame.value = meshLeafs.material.uniforms.thisHeightFrame.value
      const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame)
      meshLeafs.material.uniforms.thisHeightFrame.value = thisHeightFrame

    } else if(direction == 'forwardInTime') {
     //console.log('forward to '+frame)

      meshLeafs.material.uniforms.thisPFTFrame.value = meshLeafs.material.uniforms.nextPFTFrame.value
      const nextPFTFrame = textureFromCanvas(surfacePFTImage, cmapID.fillMethod, frame + 1)
      meshLeafs.material.uniforms.nextPFTFrame.value = nextPFTFrame

      meshLeafs.material.uniforms.thisHeightFrame.value = meshLeafs.material.uniforms.nextHeightFrame.value
      const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame + 1)
      meshLeafs.material.uniforms.nextHeightFrame.value = nextHeightFrame

    }
  }

  // define function to change texture filtering
  meshLeafs.changeFilter = (frame, oldFilter, newFilter) => { 
      
    meshLeafs.material.uniforms.thisPFTFrame.value = textureFromCanvas(surfacePFTImage, oldFilter, frame)
    meshLeafs.material.uniforms.nextPFTFrame.value = textureFromCanvas(surfacePFTImage, newFilter, frame)

    meshLeafs.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, oldFilter, frame)
    meshLeafs.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, newFilter, frame)

  }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    meshLeafs.resetTextures = (frame, filter) => { 
  
      meshLeafs.material.uniforms.thisPFTFrame.value = textureFromCanvas(surfacePFTImage, filter, frame)
      meshLeafs.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)
  
    }

    const imageLoader = new ImageLoader()

    meshLeafs.changeHeightData = async (frame, filter, heightData) => { 
    
      meshLeafs.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

      let uNewHeightGridXOffset


      if (heightData === 'Valdes et al. (2021)') {
        //shaderUniforms.uNewHeightGridXOffset = 0.0
        uNewHeightGridXOffset = 0.00725
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_height.' + modelConfig.timeRange + '.png')
      } else if (heightData === 'Scotese & Wright (1.0 deg)') {
        uNewHeightGridXOffset = 0.00139

        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.png')
      } else if (heightData === 'Scotese & Wright (0.25 deg)') {
        uNewHeightGridXOffset = 0.00035

        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.025.png')
      } 

      gsap.to(meshLeafs.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffset })

      meshLeafs.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)
      meshLeafs.material.uniforms.nextPFTFrame.value = meshLeafs.material.uniforms.thisPFTFrame.value

    }


  if(numMeshes == 2) {

    meshStems.tickEachFrame = () => { 

      meshStems.geometry.instanceCount = shaderUniforms.uTreeCount.value * biomeMultiplier * shaderUniforms.uUserTreeScale.value; 
  
      if (cameraParameters.updateOnZoom) {

        shaderUniforms.uTreeSize.value   = (shaderUniforms.uMaxTreeSize.value - 
                                            shaderUniforms.uZoomWeight.value * ( 1. *  (shaderUniforms.uMaxTreeSize.value - shaderUniforms.uMinTreeSize.value) ) ) *
                                            shaderUniforms.uUserTreeSizeScale.value;
                          
        }

    }

       // define method to update texture if keyFrame changes
    meshStems.tick = (frame, direction) => { 


    if(direction == 'backInTime') {
      //console.log('backward to '+frame)

      meshStems.material.uniforms.nextPFTFrame.value = meshStems.material.uniforms.thisPFTFrame.value
      const thisPFTFrame = textureFromCanvas(surfacePFTImage, cmapID.fillMethod, frame)
      meshStems.material.uniforms.thisPFTFrame.value = thisPFTFrame

      meshStems.material.uniforms.nextHeightFrame.value = meshStems.material.uniforms.thisHeightFrame.value
      const thisHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame)
      meshStems.material.uniforms.thisHeightFrame.value = thisHeightFrame

    } else if(direction == 'forwardInTime') {
     //console.log('forward to '+frame)

      meshStems.material.uniforms.thisPFTFrame.value = meshStems.material.uniforms.nextPFTFrame.value
      const nextPFTFrame = textureFromCanvas(surfacePFTImage, cmapID.fillMethod, frame + 1)
      meshStems.material.uniforms.nextPFTFrame.value = nextPFTFrame

      meshStems.material.uniforms.thisHeightFrame.value = meshStems.material.uniforms.nextHeightFrame.value
      const nextHeightFrame = textureFromCanvas(surfaceHeightImage, cmapID.fillMethod, frame + 1)
      meshStems.material.uniforms.nextHeightFrame.value = nextHeightFrame

    }
  }

    // define function to change texture filtering
    meshStems.changeFilter = (frame, oldFilter, newFilter) => { 
      
      meshStems.material.uniforms.thisPFTFrame.value = textureFromCanvas(surfacePFTImage, oldFilter, frame)
      meshStems.material.uniforms.nextPFTFrame.value = textureFromCanvas(surfacePFTImage, newFilter, frame)
  
      meshStems.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, oldFilter, frame)
      meshStems.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, newFilter, frame)
  
    }

    // define function to reset textures to rounded frame number after GSAP transition is complete
    meshStems.resetTextures = async (frame, filter) => { 
  
      meshStems.material.uniforms.thisPFTFrame.value = textureFromCanvas(surfacePFTImage, filter, frame)
      meshStems.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)
  
    }

    const imageLoader = new ImageLoader()

    meshStems.changeHeightData = async (frame, filter, heightData) => { 

      meshStems.material.uniforms.thisHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)

      let uNewHeightGridXOffset
      if (heightData === 'Valdes et al. (2021)') {
        //shaderUniforms.uNewHeightGridXOffset = 0.0
        uNewHeightGridXOffset = 0.00725
        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_height.' + modelConfig.timeRange + '.png')
      } else if (heightData === 'Scotese & Wright (1.0 deg)') {
        uNewHeightGridXOffset = 0.00139

        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.png')
      }  else if (heightData === 'Scotese & Wright (0.25 deg)') {
        uNewHeightGridXOffset = 0.00035

        surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.025.png')
      } 

      gsap.to(meshStems.material.uniforms.uHeightGridXOffset, { duration: 1.5, ease: 'power1.out', delay: 0.0, value: uNewHeightGridXOffset })

      meshStems.material.uniforms.nextHeightFrame.value = textureFromCanvas(surfaceHeightImage, filter, frame)
      meshStems.material.uniforms.nextPFTFrame.value = meshStems.material.uniforms.thisPFTFrame.value

    }

  }

  if(numMeshes == 2) {

    return {
      meshLeafs, meshStems
    };

  } else {

    return {
      meshLeafs
    };

  }


}

function extractGeometry(data, modelName, part) {

    let geometry

    if (modelName == 'pine_tree_1/scene.gltf') {

      if (part == 'leafs') {
        geometry = data.scene.children[0].children[0].children[0].children[0].children[0].children[0].geometry
      } else {
        geometry = data.scene.children[0].children[0].children[0].children[0].children[0].children[1].geometry
      }


    } else if (modelName == 'arbol-low-poly-reduced/scene2.glb') {

      if (part == 'leafs') {
 //       geometry = data.scene.children[0].children[0].children[0].children[1].children[0].geometry
          var mesh = data.scene.children[0]
          mesh.geometry.translate ( -.0, 3., 0 );
          mesh.geometry.scale( 2, 2, 2 );
          geometry = mesh.geometry

      } else {

        var mesh = data.scene.children[1]
        mesh.geometry.scale( 0.3, 0.3, 0.3 );
        mesh.geometry.translate ( .5, 3., 0 );
        geometry = mesh.geometry

      }


    } else if (modelName == 'bush_1_-_low_poly/scene.gltf') {

      if (part == 'leafs') {
        var mesh = data.scene.children[0].children[0].children[0].children[0].children[2].children[0]
        mesh.geometry.scale( 0.02, 0.02, 0.02 );
        geometry = mesh.geometry
      } 
  
    } else if (modelName == 'bush/scene.gltf') {

      if (part == 'leafs') {
        var mesh = data.scene.children[0].children[0].children[0].children[0]
        mesh.geometry.scale( 2, 2, 2 );
        mesh.geometry.rotateX( - Math.PI/2.);
        geometry = mesh.geometry
      } 

    } else if (modelName == 'blt/Tree 2601_blt.glb') {

      if (part == 'leafs') {

        var mesh = data.scene.children[0].children[1]
        mesh.geometry.scale( 0.5, 0.5, 0.5 );
        mesh.geometry.translate ( -.0, 3.8, 0 );
        geometry = mesh.geometry

      } else {

        var mesh = data.scene.children[0].children[0]
        mesh.geometry.scale( 0.5, 0.5, 0.5 );
        mesh.geometry.translate ( -.0, 3.8, 0 );
        geometry = mesh.geometry       

      }

    } else if (modelName == 'nlt/Tree 2601_nlt.glb') {

      if (part == 'leafs') {

        var mesh = data.scene.children[0].children[1]
//        mesh.geometry.scale( 0.8, 0.8, 0.8 );
        mesh.geometry.translate ( -.0, 2.5, 0 );
        geometry = mesh.geometry

      } else {

        var mesh = data.scene.children[0].children[0]
 //       mesh.geometry.scale( 0.8, 0.8, 0.8 );
        mesh.geometry.translate ( -.0, 2.5, 0 );
        geometry = mesh.geometry       

      }

     } else if (modelName == 'low_poly_grass_pack/grass.glb') {

        mesh = data.scene.children[0]
        mesh.geometry.scale( .4, .4, .4 );
        geometry = mesh.geometry 

      } else if (modelName == 'grass_single/grass_single.glb') {

        mesh = data.scene.children[0]
        mesh.geometry.scale( .8, .8, .8 );

        // rotate grass a bit to makle it more visible from straight above
        mesh.geometry.rotateY( Math.PI/8 );
        mesh.geometry.rotateZ( Math.PI/8 );

        geometry = mesh.geometry 
        
    } else {

      console.log(data.scene.children[0])
    }
  
    return geometry
  }

export { createTrees };