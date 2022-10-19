import { ImageLoader, LoadingManager  } from 'three';

const loadingManager = new LoadingManager( () => {
	
    // const loadingScreen = document.getElementById( 'loading-screen' );
    // loadingScreen.classList.add( 'fade-out' );
      
} );

const imageLoader = new ImageLoader(loadingManager)

async function loadInitialData( modelConfig ) {

    let data = []

    // data for surface layer
    if (modelConfig.enablePFTs) {

        const surfacePFT1Image = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_pfts1.' + modelConfig.timeRange + '.png')
        const surfacePFT2Image = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_pfts2.' + modelConfig.timeRange + '.png')    

        data.push( surfacePFT1Image, surfacePFT2Image )
    }

    if (modelConfig.enableSurface) {

        let surfaceHeightImage
        if (modelConfig.heightData === 'Valdes et al. (2021)') {
            surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_height.' + modelConfig.timeRange + '.png')
        } else if (modelConfig.heightData === 'Scotese & Wright (1.0 deg)') {
            surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.png')
        }else if (modelConfig.heightData === 'Scotese & Wright (0.25 deg)') {
            surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Scotese_PaleoDEMs.Phanerozoic.height.025.png')
        } else if (modelConfig.heightData === 'emulator') {
            surfaceHeightImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/emulator/emulator.height.png')
        }
        
        console.log(modelConfig.heightData)
        data.push( surfaceHeightImage )

    }

    if (modelConfig.enableTAS) {

        const tasDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_tas.' + modelConfig.timeRange + '.png')

        data.push( tasDataImage )

    }

    // data for atmosphere layer
    if (modelConfig.enablePrecip) {

        const prDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_pr.' + modelConfig.timeRange + '.png')

        data.push( prDataImage )

    }   

    // data for ocean layer
    if (modelConfig.enableSST) {

        const tosDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_tos.' + modelConfig.timeRange + '.png')

        data.push( tosDataImage )

    }

    // data for ocean layer
    if (modelConfig.enableSeaIce) {

        const siconcDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_siconc.' + modelConfig.timeRange + '.png')

        data.push( siconcDataImage )

    }

    if (modelConfig.enableCurrents) {

        // data for ocean currents
        const currentsDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_oceanSurfaceCurrents.' + modelConfig.timeRange + '.png')

        data.push( currentsDataImage )

    }
    
    // data for surface winds
    if (modelConfig.enableWinds) {

        const windsDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_winds.' + modelConfig.timeRange + '.png')

        data.push( windsDataImage )

    }

    // data for jet stream (200 hPa) winds
    if (modelConfig.enableJetStream) {

        const jetStreamDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_jetStream.' + modelConfig.timeRange + '.png')

        data.push( jetStreamDataImage )

    }

    // data for atmosphere layer
    if (modelConfig.enableClouds) {

        const cloudsDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_clt.' + modelConfig.timeRange + '.png')

        data.push( cloudsDataImage )

    }   

    // data for paleorotations
    if (modelConfig.enableRotation) {

        console.log('rotation')

        const rotationsDataImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/' + modelConfig.name + '_rotations.' + modelConfig.timeRange + '.png')
 
        const validAgesImage = await imageLoader.loadAsync('/modelData/' + modelConfig.project + '/' + modelConfig.name + '/Mueller2019.validAges.png')

        data.push( rotationsDataImage )
        data.push( validAgesImage )

    }  

    // return [ surfacePFT1Image, surfacePFT2Image, surfaceHeightImage, prDataImage, tosDataImage, siconcDataImage, currentsDataImage, windsDataImage ]
    return data

}

export { loadInitialData };