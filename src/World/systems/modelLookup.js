//import { timeControl } from './initialModelConfig.js'

import * as $ from 'jquery'

import Papa from 'papaparse';

// Load JSON lookup table with ages for each PALEOMAP simulation
async function loadModelList(file) {

    var modelList;

    await new Promise(done => $.getJSON(file, async function (data) {
        modelList = data.timeslice
        done();
    }));
    
    return modelList
}

function loadCMIP6CSV (file) {

  return new Promise((resolve, reject) => {

    Papa.parse(file, {

      header: true,
	  download: true,
      delimiter: ",",
      complete (results, file) {
        resolve(results.data)
      }

    })

  })

}

// Find index of experiment in JSON list that covers requested age
function findeAgeIndex(age, modelList, modelConfig ) {

    var newIndex

    if (age == -0.0 && modelConfig.timeRange == "541-0Ma") {

        newIndex = 108

    } else {

        if (modelConfig.linearTimestep) {

            newIndex = Math.floor( ( age - modelConfig.timeMin ) / modelConfig.timestep )

            if (age === modelConfig.timeMax) {

                newIndex -= 1

            }

        } else {

            var filtered = modelList.filter(obj=>obj.tMin<=age&&obj.tMax>age);
            newIndex = filtered[0].frame - 1

        }

    }

    return newIndex

}

// update timeControl object based on selected "currentTime"
function updateTimeControl(index, config, list, timeControl) {
    
    // interpolate between December and January for monthly mean data

    timeControl.currentTimeFrame = index

    if (index == 11 && config.timeRange == "mm") {

        timeControl.nextTimeFrame = 0

        timeControl.intervalTimeMin = 11.0
        timeControl.intervalTimeMax = 12.0

    } else {

        if (config.linearTimestep) {
    
            timeControl.nextTimeFrame = index + 1
    
            timeControl.intervalTimeMin = config.timeMin + index * config.timestep
            timeControl.intervalTimeMax = config.timeMin + ( index + 1 ) * config.timestep
    
            // check for last time frame
            if ( timeControl.intervalTimeMax > config.timeMax ) {
    
                timeControl.nextTimeFrame = timeControl.currentTimeFrame
                timeControl.intervalTimeMax = timeControl.intervalTimeMin
    
            }
    
        // get information from model list
        } else {
    
            if (index == 108) {
    
                timeControl.nextTimeFrame = index
        
            } else {
        
                timeControl.nextTimeFrame = index + 1 
        
            }
        
            timeControl.intervalTimeMin = list[index].tMin
            timeControl.intervalTimeMax = list[index].tMax
        
            timeControl.intervalName = list[index].period
            timeControl.intervalNameLong = list[index].longName
            timeControl.currentModelID = list[index].ID

        }    

    } 

    return timeControl

}

function findeClosestModelAge(timeControl, selectedAge) {

    const closestAge = timeControl.availableModelAges.reduce((prev, curr) => Math.abs(curr - selectedAge) < Math.abs(prev - selectedAge) ? curr : prev);

    return closestAge 

}

export { loadModelList, findeAgeIndex, updateTimeControl, findeClosestModelAge, loadCMIP6CSV };