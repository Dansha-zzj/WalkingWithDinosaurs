// define initial values for global uniforms used in shaders
export let shaderUniformsPhanerozoic = {
    
    // all layers
    uFrameWeight: { 'value': 1.0 },
    uSphereWrapAmount: { 'value': 0.0 },
    uHeightDisplacement: { 'value': 0.2 },
    uHeightDisplacementState: { 'value': 0.2 },
    uHeightGridXOffset: { 'value': 0.00725 }, //0.5 * 1/96
    uNewHeightGridXOffset: { 'value': 0.0 },
    uDarkerOcean: { 'value': 2. },
    uZoomWeight: { 'value': 0.0 },
    uPixelRatio: { 'value': 1.0 },
    uAllowVegetation: { 'value': 1.0 },

    // surface only
    uOpacitySurface: { 'value': 1.0 },
    uModifyCoastline: { 'value': false },
    uCoastlineThreshold: { 'value': 0.052 },
    uCoastlineModHighlight: { 'value': false },
    uShowLandIce: { 'value': true },
    uPFTsWeight: { 'value': 1.0 },
    uOpacityTemp: { 'value': 1.0 },

    // trees only
    uTreeCount: { 'value': 3000 },
    uMinTreeCount: { 'value': 3000 },
    // uMaxTreeCount: { 'value': 30000 },
    uMaxTreeCount: { 'value': 30000 },
    uTreeSize: { 'value': 1.2},
    uTreeSizeState: { 'value': 1.2},
    uMaxTreeSize: { 'value': 2.0},
    uMinTreeSize: { 'value': 1.},
    uUserTreeScale: { 'value': 2.5},
    uUserTreeSizeScale: { 'value': 0.6},

    // precipitation only
    uOpacityPrecipitation: { 'value': .9 },
    uOpacityPrecipitationState: { 'value': .9 },
    uHeightPrecipitation: { 'value': 0.15 },
    uHeightPrecipitationState: { 'value': 0.15 },
    uPrecipitationMinValue: { 'value': 3.5 },
    uPrecipitationMaxValue: { 'value': 12.0 },
    
    // ocean only
    uOpacityOcean: { 'value': 1.0 },
    uOpacityOceanBase: { 'value': 1.0 },
    uOpacityOceanOverlay: { 'value': 1.0 },
    uDepthOcean: { 'value': 0.0000 },
    uTransparentSeaIce: { 'value': true },
    uOceanBaseMinValue: { 'value': -2.0 },
    uOceanBaseMaxValue: { 'value': 36.0 },
    uOceanOverlayMinValue: { 'value': 0.0 },
    uOceanOverlayMaxValue: { 'value': 1.0 },

    // ocean currents only
//    uOceanParticleCount: { 'value': 65536 },
//    uOceanParticleCount: { 'value': 64 },
//    uOceanParticleCount: { 'value': 4096 },
    uOceanParticleCount: { 'value': 2048*4},
    uOceanMinParticleCount: { 'value': 30000 },
    uOceanMaxParticleCount: { 'value': 4096*64 },
    uUserOceanParticleScale: { 'value': 1.3},
    uOceanArrowSize: { 'value': 1.},
    uOceanMinArrowSize: { 'value': .35},
    uOceanMaxArrowSize: { 'value': 1.0},
    uUserOceanParticleSizeScale: { 'value': 1.},
    uOceanParticleSpeed: { 'value': 0.025 },
    uOceanParticleOpacity: { 'value': 1.0 },
    uOceanParticleLifeTime: { 'value': 400.0 },
    uRandSeed: { 'value': 1.0 },
//    uDropRate: { 'value': 0.002 },
    uDropRate: { 'value': 0.0015 },
    uDropRateBump: { 'value': 0.01 },
    uSpeedMax: { 'value': 50.0 },
    uSpeedMaxInitial: { 'value': 20.0 },
    uScaleMagnitude: { 'value': true},
    uColorMagnitude: { 'value': false},

    uWindsMaxParticleCount: { 'value': 4096*64*4 },

    // JetStream only
    uHeightJetStream: { 'value': 0.22 },
    uHeightJetStreamVerticalSpread: { 'value': 0.05 },
    uHeightJetStreamState: { 'value': 0.22 },
    uJetStreamTopographyInfluence: { 'value': 0.0 },
    uJetStreamParticleCount: { 'value': 10000},
    uUserJetStreamParticleScale: { 'value': 1.},
    uJetStreamArrowSize: { 'value': 2.},
    uJetStreamArrowSizeState: { 'value': 2.},
    uJetStreamMinArrowSize: { 'value': .3},
    uJetStreamMaxArrowSize: { 'value': 2.0},
    uJetStreamParticleSpeed: { 'value': 0.025 },
    uJetStreamParticleOpacity: { 'value': 1.0 },
    uJetStreamParticleLifeTime: { 'value': 600.0 },
    uJetStreamSpeedMin: { 'value': 20.0 },
    uJetStreamSpeedMax: { 'value': 35.0 },
    uJetStreamSpeedMaxInitial: { 'value': 100.0 },
    uJetStreamScaleMagnitude: { 'value': true},
    uJetStreamColorMagnitude: { 'value': true},
    uJetStreamZonalDataMin: { 'value': -50.0 },
    uJetStreamZonalDataMax: { 'value': 50.0 },
    uJetStreamMeridionalDataMin: { 'value': -10.0 },
    uJetStreamMeridionalDataMax: { 'value': 10.0 },
 
    // lights
    intensityAmbient: { 'value': 2.0 },
    intensitySpot: { 'value': 1.3 },

    currentNumberOfMarkers: { 'value': 0 },
    uMarkerBuildTime: { 'value': 0.0 },
    
  };


  export let shaderUniformsCOP26 = {
    
    // all layers
    uFrameWeight: { 'value': 1.0 },
    uSphereWrapAmount: { 'value': 1.0 },
    uHeightDisplacement: { 'value': 0.1 },
    uHeightDisplacementState: { 'value': 0.05 },
    uHeightGridXOffset: { 'value': 0.0 },
    uNewHeightGridXOffset: { 'value': 0.0 },
    uDarkerOcean: { 'value': 2. },
    uZoomWeight: { 'value': 0.0 },
    uPixelRatio: { 'value': 1.0 },

    // surface only
    uOpacitySurface: { 'value': 1.0 },
    uModifyCoastline: { 'value': false },
    uCoastlineThreshold: { 'value': 0.052 },
    uCoastlineModHighlight: { 'value': false },
    uShowLandIce: { 'value': true },
    uPFTsWeight: { 'value': 1.0 },
    uOpacityTemp: { 'value': 1.0 },
    uOpacityIce: { 'value': 1.0 },
    uOpacityIceState: { 'value': 1.0 },

    uOpacityPrecipitation: { 'value': .0 },
    uOpacityPrecipitationState: { 'value': .7 },
    uHeightPrecipitation: { 'value': 0.15 },
    uHeightPrecipitationState: { 'value': 0.1 },
    uPrecipitationMinValue: { 'value': 3.5 },
    uPrecipitationMaxValue: { 'value': 15.0 },


    // ocean only
    uOpacityOcean: { 'value': 1.0 },
    uOpacityOceanBase: { 'value': 1.0 },
    uOpacityOceanOverlay: { 'value': 1.0 },
    uDepthOcean: { 'value': 0.0000 },
    uTransparentSeaIce: { 'value': true },
    uOceanBaseMinValue: { 'value': -2.0 },
    uOceanBaseMaxValue: { 'value': 36.0 },
    uOceanOverlayMinValue: { 'value': 0.0 },
    uOceanOverlayMaxValue: { 'value': 1.0 },

    // lights
    intensityAmbient: { 'value': 0.7 },
    intensitySpot: { 'value': 1.0 },

  };

  export let shaderUniformsDune = {
    
    // all layers
    uFrameWeight: { 'value': 1.0 },
    uSphereWrapAmount: { 'value': 0.0 },
    uHeightDisplacement: { 'value': 0.1 },
    uHeightDisplacementState: { 'value': 0.1 },
    uHeightGridXOffset: { 'value': 0.0 },
    uNewHeightGridXOffset: { 'value': 0.0 },
    uDarkerOcean: { 'value': 2. },
    uZoomWeight: { 'value': 0.0 },
    uPixelRatio: { 'value': 1.0 },

    // surface only
    uOpacitySurface: { 'value': 1.0 },
    uModifyCoastline: { 'value': false },
    uCoastlineThreshold: { 'value': 0.052 },
    uCoastlineModHighlight: { 'value': false },
    uShowLandIce: { 'value': true },
    uPFTsWeight: { 'value': 1.0 },

    // precipitation only
    uOpacityPrecipitation: { 'value': .9 },
    uOpacityPrecipitationState: { 'value': .9 },
    uHeightPrecipitation: { 'value': 0.18 },
    uHeightPrecipitationState: { 'value': 0.18 },
    uPrecipitationMinValue: { 'value': 0.2 },
    uPrecipitationMaxValue: { 'value': 2. },
    
    // clouds only
    uOpacityClouds: { 'value': 1.0 },
    uOpacityCloudsState: { 'value': 1.0 },
    uHeightClouds: { 'value': 0.17 },
    uHeightCloudsState: { 'value': 0.17 },
    uCloudsMinValue: { 'value': 0.3 },
    uCloudsMaxValue: { 'value': 0.7 },

    // surface temperature only
    uOpacityTemp: { 'value': 0.0 },
    uTempMinValue: { 'value': -50.0 },
    uTempMaxValue: { 'value': 50.0 },

    // sand dunes only
    uOpacityDunes: { 'value': 0.0 },
    uMinDuneHeight: { 'value': 0.2 },
    uMaxDuneHeight: { 'value': 0.6 },
    uHeightDisplacementDunes: { 'value': 0.05 },

    // winds only
    uHeightWinds: { 'value': 0.0 },
    uHeightWindsVerticalSpread: { 'value': 0.0 },
    uHeightWindsState: { 'value': 0.02 },
    uWindsTopographyInfluence: { 'value': 1.0 },
    uWindsParticleCount: { 'value': 30000},
    uWindsMinParticleCount: { 'value': 4096*3 },
    uWindsMaxParticleCount: { 'value': 4096*16 },
    uUserWindsParticleScale: { 'value': 2.5},
    uUserWindsParticleSizeScale: { 'value': 1.},
    uWindsArrowSize: { 'value': 1.},
    uWindsArrowSizeState: { 'value': 1.},
    uWindsMinArrowSize: { 'value': .5},
    uWindsMaxArrowSize: { 'value': 1.5},
    uWindsParticleSpeed: { 'value': 0.02 },
    uWindsParticleOpacity: { 'value': 1.0 },
    uWindsParticleLifeTime: { 'value': 400.0 },
    uWindsSpeedMin: { 'value': 0.0 },
    uWindsSpeedMax: { 'value': 10.0 },
    uWindsSpeedMaxInitial: { 'value': 100.0 },
    uWindsScaleMagnitude: { 'value': true},
    uWindsColorMagnitude: { 'value': false},
    uWindsZonalDataMin: { 'value': -50.0 },
    uWindsZonalDataMax: { 'value': 50.0 },
    uWindsMeridionalDataMin: { 'value': -10.0 },
    uWindsMeridionalDataMax: { 'value': 10.0 },

    uRandSeed: { 'value': 1.0 },


    // lights
    intensityAmbient: { 'value': 2.0 },
    intensitySpot: { 'value': 1.3 },
    
  };

  export let shaderUniformsWoT = {
    
    // all layers
    uFrameWeight: { 'value': 1.0 },
    uSphereWrapAmount: { 'value': 0.0 },
    uHeightDisplacement: { 'value': 0.1 },
    uHeightDisplacementState: { 'value': 0.1 },
    uHeightGridXOffset: { 'value': 0.0 },
    uNewHeightGridXOffset: { 'value': 0.0 },
    uDarkerOcean: { 'value': 2. },
    uZoomWeight: { 'value': 0.0 },
    uPixelRatio: { 'value': 1.0 },

    // surface only
    uOpacitySurface: { 'value': 1.0 },
    uModifyCoastline: { 'value': false },
    uCoastlineThreshold: { 'value': 0.052 },
    uCoastlineModHighlight: { 'value': false },
    uShowLandIce: { 'value': true },
    uPFTsWeight: { 'value': 1.0 },

    // precipitation only
    uOpacityPrecipitation: { 'value': .8 },
    uOpacityPrecipitationState: { 'value': .8 },
    uHeightPrecipitation: { 'value': 0.13 },
    uHeightPrecipitationState: { 'value': 0.13 },
    uPrecipitationMinValue: { 'value': 3.0 },
    uPrecipitationMaxValue: { 'value': 20. },
    
    // clouds only
    uOpacityClouds: { 'value': 1.0 },
    uOpacityCloudsState: { 'value': 1.0 },
    uHeightClouds: { 'value': 0.12 },
    uHeightCloudsState: { 'value': 0.12 },
    uCloudsMinValue: { 'value': 0.4 },
    uCloudsMaxValue: { 'value': 1.0 },

    // surface temperature only
    uOpacityTemp: { 'value': 0.0 },
    uTempMinValue: { 'value': -30.0 },
    uTempMaxValue: { 'value': 30.0 },

    // sand dunes only
    uOpacityDunes: { 'value': 0.0 },
    uMinDuneHeight: { 'value': 0.2 },
    uMaxDuneHeight: { 'value': 0.6 },
    uHeightDisplacementDunes: { 'value': 0.05 },

    // winds only
    uHeightWinds: { 'value': 0.0 },
    uHeightWindsVerticalSpread: { 'value': 0.0 },
    uHeightWindsState: { 'value': 0.02 },
    uWindsTopographyInfluence: { 'value': 1.0 },
    uWindsParticleCount: { 'value': 30000},
    uWindsMinParticleCount: { 'value': 4096*3 },
    uWindsMaxParticleCount: { 'value': 4096*16 },
    uUserWindsParticleScale: { 'value': 2.5},
    uUserWindsParticleSizeScale: { 'value': 0.6},
    uWindsArrowSize: { 'value': 1.0},
    uWindsArrowSizeState: { 'value': 1.0},
    uWindsMinArrowSize: { 'value': .5},
    uWindsMaxArrowSize: { 'value': 1.5},
    uWindsParticleSpeed: { 'value': 0.01},
    uWindsParticleOpacity: { 'value': 1.0 },
    uWindsParticleLifeTime: { 'value': 600.0 },
    uWindsSpeedMin: { 'value': 5.0 },
    uWindsSpeedMax: { 'value': 30.0 },
    uWindsSpeedMaxInitial: { 'value': 100.0 },
    uWindsScaleMagnitude: { 'value': true},
    uWindsColorMagnitude: { 'value': false},
    uWindsZonalDataMin: { 'value': -50.0 },
    uWindsZonalDataMax: { 'value': 50.0 },
    uWindsMeridionalDataMin: { 'value': -50.0 },
    uWindsMeridionalDataMax: { 'value': 50.0 },

    uRandSeed: { 'value': 1.0 },

    // JetStream only
    uHeightJetStream: { 'value': 0.18 },
    uHeightJetStreamVerticalSpread: { 'value': 0.05 },
    uJetStreamTopographyInfluence: { 'value': 0.0 },
    uHeightJetStreamState: { 'value': 0.18 },
    uJetStreamParticleCount: { 'value': 10000},
    uUserJetStreamParticleScale: { 'value': 1.},
    uJetStreamArrowSize: { 'value': 2.},
    uJetStreamArrowSizeState: { 'value': 2.},
    uJetStreamMinArrowSize: { 'value': .3},
    uJetStreamMaxArrowSize: { 'value': 2.0},
    uJetStreamParticleSpeed: { 'value': 0.01 },
    uJetStreamParticleOpacity: { 'value': 1.0 },
    uJetStreamParticleLifeTime: { 'value': 600.0 },
    uJetStreamSpeedMin: { 'value': 30.0 },
    uJetStreamSpeedMax: { 'value': 60.0 },
    uJetStreamSpeedMaxInitial: { 'value': 100.0 },
    uJetStreamScaleMagnitude: { 'value': true},
    uJetStreamColorMagnitude: { 'value': true},
    uJetStreamZonalDataMin: { 'value': -100.0 },
    uJetStreamZonalDataMax: { 'value': 100.0 },
    uJetStreamMeridionalDataMin: { 'value': -100.0 },
    uJetStreamMeridionalDataMax: { 'value': 100.0 },
    

    // lights
    intensityAmbient: { 'value': 2.0 },
    intensitySpot: { 'value': 1.3 },
    
  };


  export let shaderUniformsNextMillion = {
    
    // all layers
    uFrameWeight: { 'value': 1.0 },
    uSphereWrapAmount: { 'value': 0.0 },
    uHeightDisplacement: { 'value': 0.2 },
    uHeightDisplacementState: { 'value': 0.2 },
    uHeightGridXOffset: { 'value': 0.0 },
    uNewHeightGridXOffset: { 'value': 0.0 },
    uDarkerOcean: { 'value': 2. },
    uZoomWeight: { 'value': 0.0 },
    uPixelRatio: { 'value': 1.0 },

    // surface only
    uOpacitySurface: { 'value': 1.0 },
    uModifyCoastline: { 'value': false },
    uCoastlineThreshold: { 'value': 0.052 },
    uCoastlineModHighlight: { 'value': false },
    uShowLandIce: { 'value': true },
    uOpacityIce: { 'value': 1.0 },
    uOpacityIceState: { 'value': 1.0 },
    uPFTsWeight: { 'value': 1.0 },

    // surface temperature only
    uOpacityTemp: { 'value': 1. },
    uTempMinValue: { 'value': -10.0 },
    uTempMaxValue: { 'value': 10.0 },   

    // lights
    intensityAmbient: { 'value': 2.0 },
    intensitySpot: { 'value': 1.3 },
    
  };