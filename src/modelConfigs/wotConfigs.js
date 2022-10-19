// configuration for active model; default view: HadCM3 3xCO2 tas
export let wot = {
  project:          'BRIDGE',
  name:             'wot1',
  experiment:       'WoT',
  timeRange:        'dm',
  heightData:       'wot1_map.png',
  gridMultiplier:   4,
  timeUnit:         'days',
  timeMin:          0.0,
  timeMax:          359.0,
  timeStart:        0.0, // initial time to display
  timeAnimationStart:0.0, // initial time to display
  timeAnimationEnd: 359.9, // initial time to display
  timeAnimationSpeed: 1.0, // initial time to display
  timeAnimationSpeedDelta: 0.25, // initial time to display
  linearTimestep:   true, // age difference between simulations is variable
  timestep:         1.0,
  showSlider:       true,
  enableWinds:      true,
  enableJetStream:  true,
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
