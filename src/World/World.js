/////////////////////////////////////////////////////////////////////////////
//
//  Structure of app is based on modular approach described in:
//  https://discoverthreejs.com/book/first-steps/world-app/
//  and
//  https://pierfrancesco-soffritti.medium.com/how-to-organize-the-structure-of-a-three-js-project-77649f58fa3f
//
//  World.js is the scene manager dealing with all three.js parts of the app.
//  It is hidden from main.js and does not know anything about the DOM. It is
//  a high-level component and does not know the details about the content of
//  the scene. It will do the following:
//
//    - create scene, camera, controls, renderer
//    - initialize the different earth objects
//    - update everything at every frame
//
//  All tasks should be performed in smaller sub-modules to keep the code
//  managebale. Modules are split into two categories: components and
//  systems. Components are anything that can be placed into the scene,
//  like the earth mesh, the camera, and the scene itself. Systems
//  are things that operate on components or other systems. Three.js should
//  only be used within the World folder and should form a self-contained
//  component that can be included into any other app or framework.
//
/////////////////////////////////////////////////////////////////////////////

import { createSurface, createDummySphere } from './components/surfaceShadows.js';
import { createCustomSurfaceCOP26 } from './components/customSurfaceCOP26Bump.js';
import { createCustomSurfaceDune } from './components/customSurfaceDune.js';
import { createCustomSurfaceWoT } from './components/customSurfaceWoT.js';
import { createCustomSurfaceNextMillion } from './components/customSurfaceNextMillion.js';
import { createPrecipitation } from './components/precipitation.js';
import { createClouds } from './components/clouds.js';
import { createOcean } from './components/ocean.js';
import { createOceanCurrents } from './components/currents/oceanCurrents.js';
import { createInitialOceanPositions } from './components/currents/oceanCurrentsInitialPositions.js';
import { createWinds } from './components/winds/winds.js';
import { createInitialWindPositions } from './components/winds/windsInitialPositions.js';
import { createTrees } from './components/trees/trees.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { createScene } from './components/scene.js';
import { createPaleomapSlider, createMonthSlider, createDaySlider, createAtmosphereRangeSlider, createOceanRangeSlider, createSurfaceElevationSlider, createVegetationSlider, createOceanCurrentsSlider } from './components/slider.js';
import { createLocationMarker } from './components/locationMarker.js';

import { createControls, createFirstPersonControls } from './systems/controls.js';
import { createRenderer } from './systems/renderer.js';
import { initComputeRenderer } from './components/currents/GPUComputationRenderer.js';
import { initComputeRendererWinds } from './components/winds/windsGPUComputationRenderer.js';
import { toggleProjectionWrap } from './systems/projection.js'
import { Resizer } from './systems/Resizer.js';
import { Loop } from './systems/Loop.js';
import { createDebugGUI, createDebugGUIDune, createDebugGUINextMillion, createDebugGUIWoT, optionsGUI } from './systems/debugGUI.js';
import { initListeners, setupKeyboardControls, setupKeyboardControlsFirstPerson } from './systems/eventListeners.js';
import { Vector2, Vector3, MathUtils as THREEMath, Spherical, ImageLoader, LoadingManager, Raycaster, SphereGeometry, CylinderGeometry, MeshBasicMaterial, Mesh, Color, MathUtils, Clock } from 'three';
import { timeControl, oceanCurrentParameters, cameraParameters } from './systems/initialModelConfig.js'
import { loadInitialData } from './systems/initialData.js'
import { findeAgeIndex, updateTimeControl, findeClosestModelAge } from './systems/modelLookup.js'
import { loadModelList, loadCMIP6CSV } from './systems/modelLookup.js'
import { getColor } from "../setup-graphing";

import gsap from 'gsap'
import * as $ from 'jquery'

let scene, camera, controls, renderer, loop, mouse, raycaster, surface, clouds, precipitation, ocean, oceanCurrents, initialPositionsOcean, winds, jetStream, windsInitialPositions, jetStreamInitialPositions, dummySphere, timeSlider, gpuComputeOcean, gpuComputeWinds, gpuComputejetStream, NLT, BLT, shrubs, grass, csv;

class World {
  constructor(container, modelConfig, projection, shaderUniforms) {

    this.modelConfig = modelConfig
    this.projection = projection
    this.container = container

    this.camera = createCamera(this.container, this.modelConfig);
    this.renderer = createRenderer();
    this.scene = createScene();
    this.container.append(this.renderer.domElement);

    this.timeControl = timeControl;

    this.controls = createControls(this.camera, this.renderer.domElement, this.projection, shaderUniforms, this.modelConfig, cameraParameters);
    //this.controlsFP = createFirstPersonControls(this.camera, this.renderer.domElement);

  //  this.controls.lookAt(0,0,0)

    this.resizer = new Resizer(this.container, this.camera, this.renderer, shaderUniforms, this.scene);

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();

  }

  async init(slider, shaderUniforms, keyFrameLoop) {

    var modelList = null

    // Load JSON lookup table with ages for each PALEOMAP simulation
    if (this.modelConfig.provideModelList) {

      modelList = await loadModelList('/JSON/scotese_02_modified.json')

      var availableModelAges = modelList.map(function(item){ return item.tMin; });

      this.timeControl.modelList = modelList
      this.timeControl.availableModelAges = availableModelAges

      this.modelList = modelList

    }

    if (this.modelConfig.experiment === "nextMillion") {

        csv = await loadCMIP6CSV( '/modelData/BRIDGE/emulator/emulator_dashBoard.csv' )
        // remove last empty row from array
        let popped = csv.pop();

    }

    this.clock = new Clock();

    this.loop = new Loop( this.camera, this.scene, this.renderer, this.timeControl, optionsGUI, modelList, this.modelConfig, cameraParameters, csv, this.controls, this.clock);

    this.loop.updateEachFrame.push(this.controls);
    //this.loop.updateEachFrame.push(this.controlsFP);

    // load initial model data
    let surfacePFT1Image, surfacePFT2Image, surfaceHeightImage, prDataImage, tosDataImage, tasDataImage, siconcDataImage, currentsDataImage, windsDataImage, jetStreamDataImage, cloudsDataImage, rotationsDataImage, validAgesImage
    
    if (this.modelConfig.name === "PALEOMAP_FosterCO2_scotese_02") {

      [ surfacePFT1Image, surfacePFT2Image, surfaceHeightImage, prDataImage, tosDataImage, siconcDataImage, currentsDataImage, jetStreamDataImage, rotationsDataImage, validAgesImage] = await loadInitialData( this.modelConfig )

    } else if (this.modelConfig.project === "CMIP6") {

      [ surfaceHeightImage, tasDataImage, prDataImage, siconcDataImage ] = await loadInitialData( this.modelConfig )

    } else if (this.modelConfig.experiment === "Dune") {

      [ surfaceHeightImage, tasDataImage, prDataImage, windsDataImage, cloudsDataImage ] = await loadInitialData( this.modelConfig )

    } else if (this.modelConfig.experiment === "WoT") {

      [ surfaceHeightImage, tasDataImage, prDataImage, windsDataImage, jetStreamDataImage, cloudsDataImage ] = await loadInitialData( this.modelConfig )

    } else if (this.modelConfig.experiment === "nextMillion") {

      [ surfaceHeightImage, tasDataImage ] = await loadInitialData( this.modelConfig )

    }

    this.rotationsDataImage = rotationsDataImage;
    this.validAgesImage = validAgesImage;
    this.tasDataImage = tasDataImage;

    // Initialise "timeControl" properties based on selected "timeControl.currentTime"
    this.timeControl.currentTime = this.modelConfig.timeStart

    // 1. Find corresponding index in "modelList" array for "timeControl.currentTime"
    var ageIndex = findeAgeIndex(this.modelConfig.timeStart, modelList, this.modelConfig);

    // 2. Set remaining properties with values of identified timeslice
    updateTimeControl(ageIndex, this.modelConfig, modelList, this.timeControl)

    // initialise surface layer
    if (this.modelConfig.enableSurface) {

      if (this.modelConfig.project === "CMIP6") {

        surface = await createCustomSurfaceCOP26(tasDataImage, siconcDataImage , this.modelConfig, shaderUniforms);

      } else if (this.modelConfig.experiment === "Dune") {

        surface = await createCustomSurfaceDune(tasDataImage, this.modelConfig, shaderUniforms, this.timeControl);

      } else if (this.modelConfig.experiment === "WoT") {

        surface = await createCustomSurfaceWoT(tasDataImage, this.modelConfig, shaderUniforms, this.timeControl);

      } else if (this.modelConfig.experiment === "nextMillion") {

        surface = await createCustomSurfaceNextMillion(tasDataImage, surfaceHeightImage, this.modelConfig, shaderUniforms, this.timeControl);
        
      } else {

        surface = await createSurface(this.modelConfig, surfacePFT1Image, surfacePFT2Image, surfaceHeightImage, shaderUniforms);

      }

      this.surface = surface

      surface.renderOrder = 1

      if (typeof keyFrameLoop == "undefined") {

        this.loop.updateEachKeyFrame.push(surface);

        if (this.modelConfig.timeRange === "541-0Ma") {

          this.loop.updateEachFrame.push(surface);

        }

      } else {

        keyFrameLoop.updateEachKeyFrame.push(surface);

      }

      this.scene.add(surface);

    }

    //dummy sphere for raycasting
    this.dummySphere = createDummySphere();
    this.scene.add(this.dummySphere);

    // 
    
    // var dummyLocationMarker = new Mesh(new SphereGeometry(0.04, 16, 12), new MeshBasicMaterial({
    //   color: 0xff0000,
    // }));

    if (this.modelConfig.timeRange === "541-0Ma") {

      this.addLocationMarker(this.scene, this.loop, this.rotationsDataImage, 'dummyLocationMarker', 0., 0., 0., 0., shaderUniforms, "#FF0000");
      var locationMarker = this.scene.getObjectByName('dummyLocationMarker');
      locationMarker.material.uniforms.uRotateMarker.value = false
      this.hideDummyMarker()

    }


    // dummyLocationMarker.visible = false
    // dummyLocationMarker = dummyLocationMarker
    // dummyLocationMarker.name = 'dummyLocationMarker'

    // this.scene.add(dummyLocationMarker);

    // initialise trees
    //    NLT = await createTrees('pine_tree_1/scene.gltf', 2, surfaceHeightImage, surfacePFT1Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value)
    //    BLT = await createTrees('arbol-low-poly-reduced/scene2.glb', 2, surfaceHeightImage, surfacePFT1Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value)
    //    shrubs = await createTrees('bush_1_-_low_poly/scene.gltf', 1, surfaceHeightImage, surfacePFT1Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value)

    cameraParameters.updateOnZoom = false

    if (this.modelConfig.enablePFTs) {

      NLT = await createTrees(this.modelConfig, 'nlt/Tree 2601_nlt.glb', 2, surfaceHeightImage, surfacePFT1Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value, 1, shaderUniforms)
      BLT = await createTrees(this.modelConfig, 'blt/Tree 2601_blt.glb', 2, surfaceHeightImage, surfacePFT1Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value, 1, shaderUniforms )
      shrubs = await createTrees(this.modelConfig, 'bush/scene.gltf', 1, surfaceHeightImage, surfacePFT1Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value, 1, shaderUniforms)
      grass = await createTrees(this.modelConfig, 'grass_single/grass_single.glb', 1, surfaceHeightImage, surfacePFT2Image, shaderUniforms.uTreeCount.value, shaderUniforms.uMaxTreeCount.value, 10, shaderUniforms)

      var vegGroup = [NLT.meshLeafs, NLT.meshStems, BLT.meshLeafs, BLT.meshStems, shrubs.meshLeafs, grass.meshLeafs ];

      for (const object of vegGroup) {
        this.scene.add(object);
        this.loop.updateEachFrame.push(object);
        this.loop.updateEachKeyFrame.push(object);
      }

      this.vegGroup = vegGroup

   }

    // create sliders
    if ( this.modelConfig.experiment === "Dune") {

      this.timeSlider = createMonthSlider(this.loop, this.camera, this.renderer, this.scene, modelList, this.modelConfig, slider, this.timeControl, optionsGUI)

    } else if ( this.modelConfig.experiment === "WoT") {

      this.timeSlider = createDaySlider(this.loop, this.camera, this.renderer, this.scene, modelList, this.modelConfig, slider, this.timeControl, optionsGUI)

    }  else {

      this.timeSlider = createPaleomapSlider(this.loop, this.camera, this.renderer, this.scene, modelList, this.modelConfig, slider, this.timeControl)

    }

    this.loop.updateEachFrame.push(this.timeSlider);

    // createAtmosphereRangeSlider()
    // createSurfaceElevationSlider()
    // createOceanRangeSlider()
    // createVegetationSlider()
    // createOceanCurrentsSlider()

    // initialise precipitation layer
    if (this.modelConfig.enablePrecip) {

      this.precipitation = await createPrecipitation(prDataImage, this.modelConfig, shaderUniforms, this.timeControl);

      this.precipitation.renderOrder = 5

      if (typeof keyFrameLoop == "undefined") {

        this.loop.updateEachKeyFrame.push(this.precipitation);

      } else {

        keyFrameLoop.updateEachKeyFrame.push(this.precipitation);

      }
      this.scene.add(this.precipitation);

    }

      // initialise clouds layer
      if (this.modelConfig.enableClouds) {

        this.clouds = await createClouds(cloudsDataImage, this.modelConfig, shaderUniforms, this.timeControl);

        this.clouds.renderOrder = 4

        this.loop.updateEachKeyFrame.push(this.clouds);

        this.scene.add(this.clouds);

      }

    // initialise ocean layer
    if (this.modelConfig.enableSST) {

      ocean = await createOcean(this.modelConfig, tosDataImage, siconcDataImage, surfaceHeightImage, shaderUniforms);
      this.ocean = ocean
      ocean.renderOrder = 1
      this.loop.updateEachKeyFrame.push(ocean);
      this.scene.add(ocean);

    }

    // initialise ocean currents
    if (this.modelConfig.enableCurrents) {

      initialPositionsOcean = await createInitialOceanPositions(shaderUniforms)
      oceanCurrents = await createOceanCurrents(initialPositionsOcean, currentsDataImage, shaderUniforms)

      oceanCurrents.renderOrder = 3
      this.loop.updateEachFrame.push(oceanCurrents);
      this.loop.updateEachKeyFrame.push(oceanCurrents);
      // scene.add(oceanCurrents);
      oceanCurrentParameters.enable = false

      gpuComputeOcean = await initComputeRenderer(initialPositionsOcean, this.renderer, oceanCurrents, currentsDataImage, surfaceHeightImage, this.modelConfig, shaderUniforms )
      this.loop.updateEachFrame.push(gpuComputeOcean);
      this.loop.updateEachKeyFrame.push(gpuComputeOcean);

    }

    // initialise atmospheric winds
    if (this.modelConfig.enableWinds) {

      windsInitialPositions = await createInitialWindPositions(shaderUniforms, 'surface')
      winds = await createWinds(windsInitialPositions, windsDataImage, shaderUniforms, this.timeControl, this.modelConfig, 'surface')

      winds.renderOrder = 3

      this.loop.updateEachFrame.push(winds);
      this.loop.updateEachKeyFrame.push(winds);
      this.scene.add(winds);

      gpuComputeWinds = await initComputeRendererWinds(windsInitialPositions, this.renderer, winds, windsDataImage, this.modelConfig, shaderUniforms, this.timeControl, 'surface' )   
      this.loop.updateEachFrame.push(gpuComputeWinds);
      this.loop.updateEachKeyFrame.push(gpuComputeWinds);

    }

    // additional jet stream layer 
    if (this.modelConfig.enableJetStream) {

      jetStreamInitialPositions = await createInitialWindPositions(shaderUniforms, 'jetStream')
      jetStream = await createWinds(jetStreamInitialPositions, jetStreamDataImage, shaderUniforms, this.timeControl, this.modelConfig, 'jetStream')

      jetStream.renderOrder = 5

      this.loop.updateEachFrame.push(jetStream);
      this.loop.updateEachKeyFrame.push(jetStream);
      this.scene.add(jetStream); 

      gpuComputejetStream = await initComputeRendererWinds(jetStreamInitialPositions, this.renderer, jetStream, jetStreamDataImage, this.modelConfig, shaderUniforms, this.timeControl, 'jetStream' )   
      this.loop.updateEachFrame.push(gpuComputejetStream);
      this.loop.updateEachKeyFrame.push(gpuComputejetStream);

    }

    var lights = createLights( shaderUniforms.intensityAmbient.value, shaderUniforms.intensitySpot.value, this.modelConfig );
    this.scene.add(lights.ambientLight, lights.mainLight);
    // loop.updateEachFrame.push(lights.mainLight);

    if (this.modelConfig.project === "CMIP6") {

      this.camera.add(lights.mainLight)
      this.scene.add(this.camera)

    }

   //  set up debug GUI for quick adjustments
    if ( this.modelConfig.experiment === "Dune") {

      createDebugGUIDune(surface, precipitation, ocean, this.renderer, this.modelConfig, gpuComputeOcean, oceanCurrents, this.scene, currentsDataImage, surfaceHeightImage, this.loop, this.camera, this.vegGroup, shaderUniforms, this.controls, this.controlsFP, cameraParameters);

   } else if ( this.modelConfig.experiment === "WoT") {

      createDebugGUIWoT(surface, precipitation, ocean, this.renderer, this.modelConfig, gpuComputeOcean, oceanCurrents, this.scene, currentsDataImage, surfaceHeightImage, this.loop, this.camera, this.vegGroup, shaderUniforms, this.controls, this.controlsFP, cameraParameters);

  } else if ( this.modelConfig.name === "emulator") {

    createDebugGUINextMillion(surface, precipitation, ocean, this.renderer, this.modelConfig, gpuComputeOcean, oceanCurrents, this.scene, currentsDataImage, surfaceHeightImage, this.loop, this.camera, this.vegGroup, shaderUniforms, this.controls, this.controlsFP, cameraParameters);

} else if ( this.modelConfig.timeRange === "541-0Ma" ) {

      createDebugGUI(surface, precipitation, ocean, this.renderer, this.modelConfig, gpuComputeOcean, oceanCurrents, this.scene, currentsDataImage, surfaceHeightImage, this.loop, this.camera, this.vegGroup, shaderUniforms, this.timeControl, this.controls, this.controlsFP, cameraParameters);

   }
    // set up event listeners
    initListeners(this.controls, this.camera, this.mouse, this.container, this.loop, optionsGUI, this.renderer, this.scene, oceanCurrents, gpuComputeOcean, currentsDataImage, surfaceHeightImage, ocean, surface, this.precipitation, this.clouds, this.timeSlider, this.vegGroup, initialPositionsOcean, winds, jetStream, this.modelConfig, shaderUniforms, this.timeControl, cameraParameters, this, this.resizer);

 //   setupKeyboardControls(this.surface, this.precipitation, this.clouds, this.ocean, vegGroup, oceanCurrents, winds)
//    setupKeyboardControlsFirstPerson(this.controls)
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  start(playIntroAnimation, playIntroHelp, shaderUniforms) {

    // end loading screen
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen.classList.add( 'fade-out' );


    function onTransitionEnd( event ) {

       event.target.remove();

     }

    // // optional: remove loader from DOM via event listener
		loadingScreen.addEventListener( 'transitionend', onTransitionEnd );

    this.loop.start();

    if (playIntroAnimation) {

      optionsGUI.introMode = true

      if (this.modelConfig.experiment === "Dune") {

        this.introAnimationDune(playIntroHelp, this.camera, this.controls, shaderUniforms, this.timeControl);

      } else if (this.modelConfig.experiment === "WoT") {

        this.introAnimationWoT(playIntroHelp, this.camera, this.controls, shaderUniforms);

      } else if (this.modelConfig.project === "CMIP6") {

        this.introAnimationCMIP6(playIntroHelp, this.camera, this.controls, shaderUniforms);

      } else if (this.modelConfig.name === "emulator") {

        this.introAnimationNextMillion(playIntroHelp, this.camera, this.controls, shaderUniforms);

      } else {

        this.introAnimationPhanerozoic(playIntroHelp, this.camera, this.controls, shaderUniforms);

      }


    }

  }

  stop() {
    this.loop.stop();
  }

  getLocation(shaderUniforms) {

   let intersect = null
   let currentIntersect = null
   let cursorLongitude = null
   let cursorLatitude = null

   this.raycaster.setFromCamera(this.mouse, this.camera)

   if(shaderUniforms.uSphereWrapAmount.value < 0.5) {
     intersect = this.raycaster.intersectObject(this.surface)
   } else {
     intersect = this.raycaster.intersectObject(this.dummySphere)
   }

   if(intersect.length) {
     cursorLongitude = intersect[0].uv.x * 360. - 180.
     cursorLatitude = intersect[0].uv.y * 180. - 90.
     currentIntersect = intersect[0]
   }
   else {
     currentIntersect = null
   }

   if(currentIntersect) {

   }

   return [ cursorLongitude, cursorLatitude ]
 }

 async surfaceDblClick(event, shaderUniforms) {

  // check that current time exactly matches an available experiment,
  // i.e. no time interpolation between two experiments is active
  // so that the map exactly matches the requested model data
  const closestModelAge = findeClosestModelAge(this.timeControl, this.timeControl.currentTime);

  // quickly travel to next available experiment if times don't match
  if (this.timeControl.currentTime != closestModelAge) {

    // reduce animation time period
    this.timeControl.transitionTime = 0.5
    // trigger time animation
    this.timeControl.selectedTime = closestModelAge;
    // wait for time animation to end + update of timeControl to feed through 
    await new Promise(r => setTimeout(r, this.timeControl.transitionTime * 1000. + 500));
    // set animation time period back to default value in the end
    this.timeControl.transitionTime = this.timeControl.defaultTransitionTime

  }

  let divOffssets = document.getElementById('world').getBoundingClientRect()

  this.mouse.x = (event.offsetX / divOffssets.width) * 2 - 1;
  this.mouse.y = -(event.offsetY / divOffssets.height) * 2 + 1;

  this.raycaster.setFromCamera(this.mouse,this.camera);

  let intersects = null

  if(shaderUniforms.uSphereWrapAmount.value < 0.5) {
    intersects = this.raycaster.intersectObject(this.surface)
  } else {
    intersects = this.raycaster.intersectObject(this.dummySphere)
  }

  if (intersects.length == 0) return [ null, null ];

  if(intersects.length) {

    var cursorLongitude = intersects[0].uv.x * 360. - 180.
    var cursorLatitude = intersects[0].uv.y * 180. - 90.

    var pointOfIntersection = new Vector3();
    pointOfIntersection = intersects[0].point;

    var locationMarker = this.scene.getObjectByName('dummyLocationMarker');

    locationMarker.material.uniforms.uLat.value = cursorLatitude
    locationMarker.material.uniforms.uLon.value = cursorLongitude
    this.showDummyMarker(shaderUniforms)

    let markerTime, markerRotationFlag
    if( this.timeControl.currentTime >= -0.1) {
    
      markerTime = 0.
      markerRotationFlag = true

    } else {

      markerTime = this.timeControl.currentTime
      markerRotationFlag = false

    }

    console.log('double-click at lon: '+cursorLongitude+' / lat: '+cursorLatitude)

    const dataSource = "Valdes et al (2021)"

    return [ cursorLongitude, cursorLatitude, this.timeControl.currentModelID, this.timeControl.intervalName, this.timeControl.intervalNameLong, dataSource, markerTime, markerRotationFlag ]

  }

 }

 hideDummyMarker() {

  var locationMarker = this.scene.getObjectByName('dummyLocationMarker');
  locationMarker.material.visible = false

}

showDummyMarker(shaderUniforms) {

  var locationMarker = this.scene.getObjectByName('dummyLocationMarker');
  var newMarkerColor = new Color(getColor(parseInt(shaderUniforms.currentNumberOfMarkers.value)))
  locationMarker.material.uniforms.uColor.value = newMarkerColor

  locationMarker.material.visible = true

  // drop new marker from above
  shaderUniforms.uMarkerBuildTime.value = 5.0
  gsap.to(shaderUniforms.uMarkerBuildTime, { duration: .1, ease: 'power4', delay: 0, value: 0.0 })

}

async rotateToModern(age, lat, lon) {

  //use GPlates Web service to reconstruct modern location of selected paleo location
  const gwsURL = "https://gws.gplates.org/reconstruct/reconstruct_points/?points="+lon+","+lat+"&time="+age+"&model=PALEOMAP&reverse"
  const gwsResponse = await fetch(gwsURL)
  const gwsJSON = await gwsResponse.json(); //extract JSON from the http response
  console.log(gwsJSON.coordinates[0][0])

  return [ gwsJSON.coordinates[0][0], gwsJSON.coordinates[0][1] ] 

}

async findValidAgeGWS(lat, lon) {

  //use GPlates Web service to reconstruct modern location of selected paleo location
  const gwsURL = "https://gws.gplates.org/reconstruct/reconstruct_points/?points="+lon+","+lat+"&time=0&model=MULLER2019&fc"
  console.log(gwsURL)

  const gwsResponse = await fetch(gwsURL)
  const gwsJSON = await gwsResponse.json(); //extract JSON from the http response
  
  const validAge = -1. * gwsJSON.features[0].properties.valid_time[0]


  return [ validAge ] 

}

async findValidAgeTexture(modernLat, modernLon) {

  var numLon = 721
  var numLat = 361
  //var lonPixel = Math.round( ( (modernLon + 180) / 360 + ( 1. / 96. / 2.0) ) * numLon)
  // var lonPixel = Math.round( ( (modernLon + 180) / 360 ) * numLon)
  // var latPixel = numLat - Math.round((modernLat + 90) / 180 * numLat)

  var lonList = [];
  for (let ii = 0; ii < numLon; ii++) {
    lonList.push( -180. + ii * 0.5);
  }

  var latList = [];
  for (let ii = 0; ii < numLat; ii++) {
    latList.push( 90. - ii * 0.5);
  }

  var closestLon = lonList.reduce(function(prev, curr) {
    return (Math.abs(curr - modernLon) < Math.abs(prev - modernLon) ? curr : prev);
  });
  var closestLat = latList.reduce(function(prev, curr) {
    return (Math.abs(curr - modernLat) < Math.abs(prev - modernLat) ? curr : prev);
  });

  var lonPixel = lonList.indexOf(closestLon)
  var latPixel = latList.indexOf(closestLat)

  // put relevant frame to offscreen canvas to access data
  const canvas=document.createElement('canvas')

  canvas.width = numLon
  canvas.height = numLat

  canvas.getContext('2d').drawImage(this.validAgesImage, 0 , 0, numLon, numLat);

  console.log(canvas.width)
  const pixelData = canvas.getContext('2d').getImageData(lonPixel, latPixel, 1, 1).data
  //const pixelData = canvas.getContext('2d').getImageData(0, 0, numLon, numLat)

  const validAge = pixelData[0] / 255. * -550.

  return [ validAge ] 

}

async rotateToPast(age, modernLat, modernLon) {

  // let paleoLat, paleoLon

  //get paleolocations from dataImage at selected frame and coordinates

  // var numLon = 96
  // var numLat = 73
  var numLon = 181
  var numLat = 91
  //var lonPixel = Math.round( ( (modernLon + 180) / 360 + ( 1. / 96. / 2.0) ) * numLon)
  // var lonPixel = Math.round( ( (modernLon + 180) / 360 ) * numLon)
  // var latPixel = numLat - Math.round((modernLat + 90) / 180 * numLat)

  var lonList = [];
  for (let ii = 0; ii < numLon; ii++) {
    // lonList.push( -180. + ii * 3.75);
    lonList.push( -180. + ii * 2.0);
  }
  lonList[0] = -179.9
  lonList[-1] = -179.9

  var latList = [];
  for (let ii = 0; ii < numLat; ii++) {
    // latList.push( 90. - ii * 2.5);
    latList.push( 90. - ii * 2.0);
  }
  // latList[0] = 88.75
  // latList[-1] = -88.75
  latList[0] = 89.
  latList[-1] = -89.

  var closestLon = lonList.reduce(function(prev, curr) {
    return (Math.abs(curr - modernLon) < Math.abs(prev - modernLon) ? curr : prev);
  });
  var closestLat = latList.reduce(function(prev, curr) {
    return (Math.abs(curr - modernLat) < Math.abs(prev - modernLat) ? curr : prev);
  });

  var deltaLon = modernLon - closestLon
  var deltaLat = modernLat - closestLat

  var lonPixel = lonList.indexOf(closestLon)
  var latPixel = latList.indexOf(closestLat)

  var paleoFrame = findeAgeIndex(age, this.modelList, this.modelConfig )

  const paleoModelID = this.modelList[paleoFrame].ID
  const paleoPeriod = this.modelList[paleoFrame].period
  const paleoPeriodLong = this.modelList[paleoFrame].longName

  // put relevant frame to offscreen canvas to access data
  const canvas=document.createElement('canvas')

  canvas.getContext('2d').drawImage(this.rotationsDataImage, numLon * (paleoFrame), 0, numLon , numLat, 0, 0, numLon, numLat);

  const pixelData = canvas.getContext('2d').getImageData(lonPixel, latPixel, 1, 1).data

  const paleoLat = pixelData[0] / 255. * 180 - 90. + deltaLat
  const paleoLon = pixelData[1] / 255. * 360 - 180. + deltaLon

  return [ paleoLat, paleoLon, paleoModelID, paleoPeriod, paleoPeriodLong ] 

}

addLocationMarker(scene, loop, rotationsDataImage, locationID, lat, lon, modernLon, modernLat, shaderUniforms, color, markerTime, validAge, markerRotationFlag) {

    var locationMarker

    if (locationID != "dummyLocationMarker") {

      locationMarker = createLocationMarker(lat, lon, modernLon, modernLat, rotationsDataImage, shaderUniforms, color, false, markerRotationFlag);

      shaderUniforms.currentNumberOfMarkers.value += 1
      loop.updateEachFrame.push(locationMarker);
      loop.updateEachKeyFrame.push(locationMarker);

      // rotating markers
      if ( markerRotationFlag ) {

        locationMarker.material.uniforms.uRotateMarker.value = true
        locationMarker.material.uniforms.uModernLat.value = lat
        locationMarker.material.uniforms.uModernLon.value = lon
        locationMarker.material.uniforms.uValidAgeMin.value = 0.
        locationMarker.material.uniforms.uValidAgeMax.value = validAge

      // fixed markers
      } else {

        locationMarker.material.uniforms.uValidAgeMin.value = markerTime
        locationMarker.material.uniforms.uValidAgeMax.value = markerTime

      }

    // dummy marker
    } else {

      locationMarker = createLocationMarker(lat, lon, modernLon, modernLat, rotationsDataImage, shaderUniforms, color, true, false);
      loop.updateEachFrame.push(locationMarker);
      locationMarker.material.uniforms.uValidAgeMin.value = -999
      locationMarker.material.uniforms.uValidAgeMax.value = -999

    }

    locationMarker.name = locationID
    scene.add(locationMarker);

}

removeLocationMarker(scene, locationID, shaderUniforms) {

  var selectedObject = scene.getObjectByName(locationID);

  selectedObject.material.uniforms.uMarkerAnimate.value = true

  // move marker to top
  gsap.to(shaderUniforms.uMarkerBuildTime, { duration: .5, ease: 'power.in', delay: 0, value: 5.0, onComplete: () => {
  
    scene.remove( selectedObject );
    shaderUniforms.uMarkerBuildTime.value = 0.0

  }})

  shaderUniforms.currentNumberOfMarkers.value -= 1

}

goToTime(time) {

  this.timeControl.selectedTime = time

}

goToPlace(controls, lat, lon, shaderUniforms) {

  if ( shaderUniforms.uSphereWrapAmount.value >= 0.5) {
      
    var newTheta = lon * MathUtils.DEG2RAD
    var newPhi = -1. * ( ( lat - 90. ) * MathUtils.DEG2RAD )
  
    controls.dollyTo( 20.0, true )
    controls.rotateTo( newTheta, newPhi, true)

    setTimeout(function(){

      controls.dollyTo( 8.0, true )
      controls.zoomTo( 1.1, true )

  }, 250);

   }  

}


  sphereClick(event, scene1, scene2, duration, copTexture ) {

    function createPoint(position, scene1, scene2, copTexture) {

      var spherical = new Spherical();
      var lat, lon;

      var point1 = new Mesh(new SphereGeometry(0.04, 16, 12), new MeshBasicMaterial({
        map: copTexture
      }));

      var point2 = new Mesh(new SphereGeometry(0.04, 16, 12), new MeshBasicMaterial({
        map: copTexture
      }));

      point1.position.copy(position);
      point2.position.copy(position);

      scene1.add(point1);
      scene2.add(point2);

      setTimeout(function(){

        scene1.remove(point1);
        scene2.remove(point2);

      }, duration + 500);

      spherical.setFromVector3(position);
      lat = THREEMath.radToDeg(Math.PI / 2 - spherical.phi);
      lon = THREEMath.radToDeg(spherical.theta);

      return [ lon, lat ]

    }

    var pointOfIntersection = new Vector3();
    var localPoint = new Vector3();

    let divOffssets = document.getElementById('world1').getBoundingClientRect()

    this.mouse.x = (event.offsetX / divOffssets.width) * 2 - 1;
    this.mouse.y = -(event.offsetY / divOffssets.height) * 2 + 1;



    this.raycaster.setFromCamera(this.mouse,this.camera);
    var intersects = this.raycaster.intersectObject(this.surface);


    if (intersects.length == 0) return [ null, null ];


    if(intersects.length) {

      pointOfIntersection = intersects[0].point;
      this.surface.worldToLocal(localPoint.copy(pointOfIntersection));

      var [ cursorLongitude, cursorLatitude ] = createPoint(localPoint, scene1, scene2, copTexture);


      if (cursorLongitude >= -90) {
        cursorLongitude -= 90.
      } else {
        cursorLongitude += 270.
      }


      //console.log('lon: '+cursorLongitude+' / lat: '+cursorLatitude)
      return [ cursorLongitude, cursorLatitude ]

    }


  }


  introAnimationPhanerozoic(playIntroHelp, camera, controls, shaderUniforms){

    var initialuHeightDisplacement = shaderUniforms.uHeightDisplacement.value
    shaderUniforms.uHeightDisplacement.value = 0.0
    shaderUniforms.uOpacitySurface.value = 0.
    shaderUniforms.uOpacityOcean.value = 0.
    shaderUniforms.uDepthOcean.value = 0.12
    shaderUniforms.uOpacityPrecipitation.value = 0.
    shaderUniforms.uPFTsWeight.value = 0.
    shaderUniforms.uTreeSize.value = 0.
    shaderUniforms.uOceanParticleOpacity.value = 0.0
    shaderUniforms.uJetStreamParticleOpacity.value = 0.0
    shaderUniforms.uDarkerOcean.value = 0.

    controls.rotate( 0, 0.9, false)
    controls.zoomTo( 1.1, false )

    setTimeout(function() {
      eventFire(document.getElementById('surfcOnOff'), 'click')
    }, 0);

    setTimeout(function() {
      gsap.to(shaderUniforms.uHeightDisplacement, { duration: 1., ease: 'power1.out', delay: 0, value: initialuHeightDisplacement })
    }, 1000);    

    setTimeout(function() {
      toggleProjectionWrap(controls, camera, 'equator', shaderUniforms)
      var button = document.getElementById('toggleProjection-button')
      button.style.color = "white"
    }, 1700);

    setTimeout(function() {
      eventFire(document.getElementById('oceanOnOff'), 'click')
    }, 2200);

    setTimeout(function() {
      shaderUniforms.uTreeSize.value = 0.
      optionsGUI.introMode = true
      eventFire(document.getElementById('vegOnOff'), 'click')
    }, 2000);

    setTimeout(function() {
      eventFire(document.getElementById('currentsOnOff'), 'click')
    }, 3500);

    setTimeout(function() {
      optionsGUI.introMode = true
      eventFire(document.getElementById('precipOnOff'), 'click')
    }, 4500);

    setTimeout(function() {
      optionsGUI.introMode = true
      eventFire(document.getElementById('jetStreamOnOff'), 'click')
      optionsGUI.introMode = false
      cameraParameters.updateOnZoom = true
    }, 4700);

    if (playIntroHelp) {

      setTimeout(function() {
        introJs().setOptions({
          steps: [
          {
            title: "Welcome to the climatearchive!",
            intro: "This website visualises the results of 109 different climate model simulations covering the climate history of the last 540 million years.",
          },
          {
            element: document.querySelector('#world'),
            title: "This is the Earth",
            intro: "You can change the view by dragging the globe or zooming in and and out. <br><br>left click/one finger: <b>drag</b> <br>mouse wheel/two finger: <b>zoom</b> <br><br> Give it a try!",
            position: 'right'
          },
          {
            element: document.querySelector('#header'),
            intro: 'The toolbar on the left can open the menu or change the projection and interpolation method. <br><br>Click on Open Controls on the top right to tweak individual parameters of the visualisation and have some fun!',
            position: 'bottom'
          },
          {
            element: document.querySelector('#nav-bar'),
            title: "These are the model layers",
            intro: "Mix and match any model data shown on the globe simply by clicking on these icons.",
            position: 'top'
          },
          {
            element: document.querySelector('#geologicTimescale'),
            title: "This is the time machine",
            intro: 'You can select any period on the geologic time scale and you will travel through millions of years within a matter of seconds. Hover with the mouse for a preview or left-click to lock the selected interval.',
            position: 'top'
          },
          {
            element: document.querySelector('#world'),
            title: "Data download",
            intro: 'You can double-click anywhere on the globe to plot simulated local climatologies and downlad figures and CSV data.',
            position: 'top'
          },          
          {
            title: "You've made it!",
            intro: "Start exploring the climate archive now. <br><br> Or get in touch via: <br><br> sebastian.steinig@bristol.ac.uk <br><br> <b>Have fun!</b>"
          }]
        }).start();
      }, 6500);

    }

  }



  introAnimationDune(playIntroHelp, camera, controls, shaderUniforms){

    var initialuHeightDisplacement = shaderUniforms.uHeightDisplacement.value
    shaderUniforms.uHeightDisplacement.value = 0.0
    shaderUniforms.uOpacitySurface.value = 0.
    shaderUniforms.uOpacityPrecipitation.value = 0.
    shaderUniforms.uOpacityClouds.value = 0.
    shaderUniforms.uWindsParticleOpacity.value = 0.0

    controls.rotate( 0, 0.9, false)
    controls.zoomTo( 1.0, false )

    setTimeout(function() {
      eventFire(document.getElementById('surfcOnOff'), 'click')
    }, 0);

    setTimeout(function() {
      gsap.to(shaderUniforms.uHeightDisplacement, { duration: 1., ease: 'power1.out', delay: 0, value: initialuHeightDisplacement })
    }, 500);

    setTimeout(function() {
      eventFire(document.getElementById('dunesOnOff'), 'click')
    }, 1000);

    setTimeout(function() {
      eventFire(document.getElementById('playForward-button'), 'click')
    }, 1000);

    setTimeout(function() {
      toggleProjectionWrap(controls, camera, 'equator', shaderUniforms)
      var button = document.getElementById('toggleProjection-button')
      button.style.color = "white"
    }, 1700);

    setTimeout(function() {
      eventFire(document.getElementById('windsOnOff'), 'click')
    }, 2700);

    setTimeout(function() {
      eventFire(document.getElementById('cloudsOnOff'), 'click')
    }, 3500);

    // setTimeout(function() {
    //   timeControl.introMode = true
    //   eventFire(document.getElementById('precipOnOff'), 'click')
    // }, 4500);

    setTimeout(function() {
      eventFire(document.getElementById('spinGlobe-button'), 'click')
      optionsGUI.introMode = false
    }, 5500);


    if (playIntroHelp) {

      setTimeout(function() {
        introJs().setOptions({
          steps: [
          {
            title: "Welcome to the climatearchive!",
            intro: "This website visualises the results of climate model simulations across time and space.",
          },
          {
            element: document.querySelector('#world'),
            title: "This is Arrakis!",
            intro: "You can change the view by dragging the globe or zooming in and and out. <br><br>left click/one finger: <b>drag</b> <br>mouse wheel/pinch: <b>zoom</b> <br><br> Give it a try!",
            position: 'right'
          },
          {
            element: document.querySelector('#header'),
            intro: 'The toolbar on the left can open the menu and toggle the projection and rotation. <br><br>Click on Open Controls on the top right to tweak individual parameters of the visualisation and have some fun!',
            position: 'bottom'
          },
          {
            element: document.querySelector('#nav-bar'),
            title: "These are the model layers!",
            intro: "Mix and match any model data shown on the globe simply by clicking on these icons.",
            position: 'top'
          },
          {
            element: document.querySelector('#monthControls'),
            title: "These are the time controls!",
            intro: 'You can loop through the simulated seasonal cycle or select individual months with the slider.',
            position: 'top'
          },
          {
            title: "You've made it!",
            intro: "Start exploring Arrakis now. <br><br> Or use the home button on the left to see how we actually use the same climate model to reconstruct the climate history of our own Earth over the past 540 million years!</b>"
          }]
        }).start();
      }, 7500);

    }

  }

  introAnimationWoT(playIntroHelp, camera, controls, shaderUniforms){

    var initialuHeightDisplacement = shaderUniforms.uHeightDisplacement.value
    shaderUniforms.uHeightDisplacement.value = 0.0
    shaderUniforms.uOpacitySurface.value = 0.
    shaderUniforms.uOpacityPrecipitation.value = 0.
    shaderUniforms.uOpacityClouds.value = 0.
    shaderUniforms.uWindsParticleOpacity.value = 0.0
    shaderUniforms.uJetStreamParticleOpacity.value = 0.0

    controls.rotate( 0, 0.9, false)
    controls.zoomTo( 1.0, false )

    setTimeout(function() {
      eventFire(document.getElementById('surfcOnOff'), 'click')
    }, 0);
  
    setTimeout(function() {
      gsap.to(shaderUniforms.uHeightDisplacement, { duration: 1., ease: 'power1.out', delay: 0, value: initialuHeightDisplacement })
    }, 500);

    setTimeout(function() {
      eventFire(document.getElementById('playForward-button'), 'click')
    }, 1000);
  
    setTimeout(function() {
      toggleProjectionWrap(controls, camera, 'equator', shaderUniforms)
      var button = document.getElementById('toggleProjection-button')
      button.style.color = "white"
    }, 1700);

    setTimeout(function() {
      eventFire(document.getElementById('windsOnOff'), 'click')
    }, 2700);

    setTimeout(function() {
      eventFire(document.getElementById('tempOnOff'), 'click')
    }, 3500);
  
    setTimeout(function() {
      timeControl.introMode = true
      eventFire(document.getElementById('jetStreamOnOff'), 'click')
    }, 4500);
 
    setTimeout(function() {
      eventFire(document.getElementById('spinGlobe-button'), 'click')
      optionsGUI.introMode = false
    }, 5500);

  
    if (playIntroHelp) {
  
      setTimeout(function() {
        introJs().setOptions({
          steps: [
          {
            title: "Welcome to the climatearchive!",
            intro: "This website visualises the results of climate model simulations across time and space.",
          },
          {
            element: document.querySelector('#world'),
            title: "This is Randland!",
            intro: "The world of The Wheel of Time. You can change the view by dragging the globe or zooming in and and out. <br><br>left click/one finger: <b>drag</b> <br>mouse wheel/pinch: <b>zoom</b> <br><br> Give it a try!",
            position: 'right'
          },
          {
            element: document.querySelector('#header'),
            intro: 'The toolbar on the left can open the menu and toggle the projection and rotation. <br><br>Click on Open Controls on the top right to tweak individual parameters of the visualisation and have some fun!',
            position: 'bottom'
          },
          {
            element: document.querySelector('#nav-bar'),
            title: "These are the model layers!",
            intro: "Mix and match any model data shown on the globe simply by clicking on these icons.",
            position: 'top'
          },
          {
            element: document.querySelector('#monthControls'),
            title: "These are the time controls!",
            intro: 'The animation will loop automatically through one year of daily model data to explore weather patterns. You can also pause the loop and move the slider on your own.',
            position: 'top'
          },
          {
            title: "You've made it!",
            intro: "Start exploring Randland now. <br><br> Or use the home button on the left to see how we actually use a similar climate model to reconstruct the climate history of our own Earth over the past 540 million years!</b>"
          }]
        }).start();
      }, 7500);
  
    }
  
  }


  introAnimationCMIP6(playIntroHelp, camera, controls, shaderUniforms){

    // setTimeout(function() {
    //   gsap.to(camera.position, {

    //     duration: 4.0,
    //     ease: 'power1',
    //     delay: 0,
    //     x: 9.21,
    //     y: 6.74,
    //     z: -3.72

    //   })  }, 500);

    controls.dampingFactor  = 0.004
    controls.rotateTo( 2.0, 1.8, false)

    setTimeout(function() {
      controls.rotateTo( 0.8, 1.2, true)
      controls.zoomTo( 1.3, true )
    }, 500);

    setTimeout(function() {
      eventFire(document.getElementById('spinGlobe-button'), 'click')
      controls.dampingFactor  = 0.0
    }, 6000);


      if (playIntroHelp) {

        setTimeout(function() {
          introJs().setOptions({
            steps: [
            {
              title: "Welcome!",
              intro: "This website shows model projections for two different future emission scenarios to show what is at stake at COP26 in Glasgow.",
            },
            {
              element: document.querySelector('#worldRow'),
              title: "Controls",
              intro: "You can change the view by dragging the globe or zooming in and and out. You can also double-click anywhere on the globe to see a timeseries of local warming!",
              position: 'right'
            },
            {
              element: document.querySelector('#stripes'),
              title: "These are the time controls!",
              intro: 'Drag the slider or click anywhere on the warming stripes to change time.',
              position: 'top'
            },
            {
              element: document.querySelector('#nav-bar'),
              title: "Layers",
              intro: "Select different data layers by clicking on these icons. Variables are relative precipitation change, near surface air temperature anomaly and monthly minimum (i.e. summer) sea ice area.",
              position: 'top'
            },
            {
              title: "Thats it!",
              intro: "Compare the regional consequences of a 1.5&#176;C or 3.0&#176;C world and decide: Which Future Do You Want?"
            }]
          }).start();
        }, 5500);

      }

  }

  introAnimationNextMillion(playIntroHelp, camera, controls, shaderUniforms){

      setTimeout(function() {
        controls.dampingFactor = 0.005
        controls.rotateTo( -0.5, 1.2, true)
        controls.zoomTo( 1.25, true )
      }, 500);

      setTimeout(function() {
        eventFire(document.getElementById('playForward-button'), 'click')
      }, 500);

      setTimeout(function() {
        controls.dampingFactor = 0.015
      }, 5000);

      if (playIntroHelp) {

        setTimeout(function() {
          introJs().setOptions({
            steps: [
            {
              title: "Next Million Years",
              intro: "This page shows a possible long-term evolution of the future climate over the next one million years following a brief but strong anthropogenic warming (RCP8.5).<br><br>More info at:<br>https://tinyurl.com/2p8nr6uj",
            },
            {
              title: "Changing Time",
              intro: "Click anywhere on the warming stripes below or drag the slider to change the displayed time.",
            }]
          }).start();
        }, 2500);
    
      }
  }

}




function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}



export { World };
