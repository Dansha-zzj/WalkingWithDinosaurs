import { Vector3 } from 'three'

// configuration for active model; default view: HadCM3 3xCO2 tas
// export let modelID = {
//   project:    'BRIDGE',
//   name:       'PALEOMAP_FosterCO2_scotese_02',
//   experiment: 'merged',
//   timeRange:    '541-0Ma',
//   // heightData: 'Valdes et al. (2021)', // 'Scotese & Wright (1.0 deg)'
//   heightData: 'Scotese & Wright (1.0 deg)', // 'Scotese & Wright (1.0 deg)'
//   gridMultiplier: 2,
// };

// configuration colormap
export let cmapID = {
  name:       'Topo4',
  fillMethod: 'LinearFilter'
};

// model simulation to display at start up (109 = present day)
export let timeControl = {
  currentTime: -999., 
  selectedTime: -999.0, // dummy value, will be set if user clicks on geologic time scale
  currentTimeFrame : -999, // dummy value, will be set based on currentTime during initialisation
  nextTimeFrame : -999, // dummy value, will be set based on currentTime during initialisation
  intervalTimeMin: -999, // dummy value, will be set based on currentTime during initialisatio
  intervalTimeMax: -999, // dummy value, will be set based on currentTime during initialisatio
  intervalName: '', // dummy value, will be set based on currentTime during initialisatio
  intervalNameLong: '', // dummy value, will be set based on currentTime during initialisatio
  currentModelID: '', // dummy value, will be set based on currentTime during initialisatio
  currentTimescaleMin: -999., // dummy value, will be set once geologic time scale is used
  currentTimescaleMax: -999., // dummy value, will be set once geologic time scale is used
  selectedTimescaleMin: -999., // dummy value, will be set once geologic time scale is used
  selectedTimescaleMax: -999., // dummy value, will be set once geologic time scale is used
  transitionTime: 1.5, // time for smooth time transition
  defaultTransitionTime: 1.5, // time for smooth time transition
  monthFrame: 0, // months 1-12; 0 = annual mean
  autoUpdateFrameWeight: true,
  introMode: true,
  hoverMode: true,
  updateTimeLabel: true,
  enableSlider: true,
  frameWeight: 0.,
  forceUpdate: false
}

// parameters for ocean current animation
export let oceanCurrentParameters = {
  enable: true,
  enableArrows: true,
  enable3D: false,
  damping: 0.995,
  percentDrop: 0.1
}

// parameters for camera
export let cameraParameters = {
  currentZoom: null,
  particlesResetThreshold: 0.1,
  updateOnZoom: true,
  FPCenabled: false,
  activateFPC: false,
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,  
  moveUp: false,
  moveDown: false, 
  autoRotate: false,
  autoRotateState: false,
  autoRotateSpeed: 0.2, // radians * deltaTime per frame
  directionFPC: new Vector3(),
  velocityFPC: new Vector3(),

}
