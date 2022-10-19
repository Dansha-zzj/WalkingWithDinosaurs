// configuration for active model; default view: HadCM3 3xCO2 tas
export let dune = {
  project:          'BRIDGE',
  name:             'tfgzk',
  experiment:       'Dune',
  timeRange:        'mm',
  heightData:       'tfgzk_height.png',
  gridMultiplier:   2,
  timeUnit:         'months',
  timeMin:          0.0,
  timeMax:          12.,
  timeStart:        0.0, // initial time to display
  timeAnimationStart:0.0, // initial time to display
  timeAnimationEnd: 12., // initial time to display
  timeAnimationSpeed: 0.5, // initial time to display
  timeAnimationSpeedDelta: 0.25, // initial time to display
  linearTimestep:   true, // age difference between simulations is variable
  timestep:         1.0,
  showSlider:       true,
  enableWinds:      true,
  enablePrecip:     true,
  enableClouds:     true,
  enableSurface:    true,
  enableLandIce:    false,
  enablePFTS:       false,
  enableVeg:        false,
  enableTAS:        true,
  enableSST:        false,
  enableCurrents:   false,
  staticHeight:     true,
  provideModelList: false,
  modelList:        ''
};

export let duneHighRes = {
  project:          'BRIDGE',
  name:             'tfiga',
  experiment:       'Dune',
  timeRange:        'mm',
  heightData:       'tfiga_height.png',
  gridMultiplier:   1,
  timeUnit:         'months',
  timeMin:          0.0,
  timeMax:          12.,
  timeStart:        0.0, // initial time to display
  timeAnimationStart:0.0, // initial time to display
  timeAnimationEnd: 12., // initial time to display
  timeAnimationSpeed: 0.5, // initial time to display
  timeAnimationSpeedDelta: 0.25, // initial time to display
  linearTimestep:   true, // age difference between simulations is variable
  timestep:         1.0,
  showSlider:       true,
  enableWinds:      true,
  enablePrecip:     true,
  enableClouds:     true,
  enableSurface:    true,
  enableLandIce:    false,
  enablePFTS:       false,
  enableVeg:        false,
  enableTAS:        true,
  enableSST:        false,
  enableCurrents:   false,
  staticHeight:     true,
  provideModelList: false,
  modelList:        ''
};