// configuration for active model; default view: HadCM3 3xCO2 tas
export let Scotese02 = {
  project:          'BRIDGE',
  name:             'PALEOMAP_FosterCO2_scotese_02',
  experiment:       'merged',
  timeRange:        '541-0Ma',
  // heightData:       'Valdes et al. (2021)', // 'Scotese & Wright (1.0 deg)'
 //heightData:       'Scotese & Wright (1.0 deg)', // 'Scotese & Wright (1.0 deg)'
 heightData:       'Scotese & Wright (0.25 deg)', // 'Scotese & Wright (0.25 deg)'
  gridMultiplier:   2,
  timeUnit:         'Ma',
  timeMin:          -541.0,
  timeMax:          -0.0,
  timeStart:        -0.0, // initial time to display
  timeAnimationStart:-541.0, // initial time to display
  timeAnimationEnd: -0.0, // initial time to display
  timeAnimationSpeed: 2., // initial time to display
  timeAnimationSpeedDelta: 1., // initial time to display
  linearTimestep:   false, // age difference between simulations is variable
  timestep:         -999.,
  showSlider:       false, 
  enableWinds:      false,
  enableJetStream:  true,
  enablePrecip:     true,
  enableClouds:     false,
  enableSurface:    true,
  enableLandIce:    true,
  enablePFTs:       true,
  enableVeg:        true,
  enableTAS:        false,
  enableSST:        true,
  enableSeaIce:     true,
  enableCurrents:   true,
  enableRotation:   true,
  staticHeight:     false,
  provideModelList: true,
  modelList:        '/JSON/scotese_02_modified.json'
};