// Slider
import noUiSlider from 'nouislider';
import gsap from 'gsap'
import 'nouislider/distribute/nouislider.css';

import { findeClosestModelAge } from '../systems/modelLookup.js';

function createPaleomapSlider(loop, camera, renderer, scene, modelList, modelConfig, slider, timeControl) {

    // set visibility
    if (modelConfig.showSlider) {

        slider.style.display = "block"

    } else {

        slider.style.display = "none"

    }

    // number of decimal places 
    var decimals = 0;

    // format object
    var numberFormat = {
        // 'to' the formatted value. Receives a number.
        to: function (value) {
            return value.toFixed(decimals) * -1.0+modelConfig.timeUnit;
        },
        // 'from' the formatted value.
        // Receives a string, should return a number.
        from: function (value) {
            return Number(value);;
        }
    };

    noUiSlider.create(slider, {
        start: timeControl.currentTime,
   //     tooltips:  [numberFormat], // tooltip with custom formatting,
   //     format: numberFormat,
        range: {
            'min': modelConfig.timeMin,
            'max': modelConfig.timeMax
        },
        // pips: {
        //     mode: 'count',
        //     values: 6,
        //     density: 100
        // }
    });

    slider.noUiSlider.on('slide', function (values, handle) {

        timeControl.currentTime = values[handle]
  
    });

    slider.noUiSlider.on('click', function (values, handle) {

        timeControl.currentTime = values[handle]
  
    });

    slider.tickEachFrame = () => { 

        slider.noUiSlider.set(timeControl.currentTime);
                
        // Check if geologic timescale is used to change displayed time
        if (timeControl.selectedTime != -999) {

            let newAge

            if (timeControl.hoverMode) {

                newAge = timeControl.selectedTime

                if ( (modelConfig.project == "CMIP6")) {

                    timeControl.transitionTime = 0.2

                }

            } else {

                if (modelConfig.provideModelList) {

                    newAge = findeClosestModelAge(timeControl, timeControl.selectedTime)

                } else {

                    timeControl.transitionTime = 4.0
                    newAge = parseFloat(timeControl.selectedTime)

                }

                console.log('selected: ' + timeControl.selectedTime)
                console.log('closest: ' + newAge)

            }

            timeControl.selectedTime = -999

            gsap.to(timeControl, { duration: timeControl.transitionTime, ease: 'power3', currentTime: newAge})

        }
    
      }

    return slider

}



function createMonthSlider(loop, camera, renderer, scene, modelList, modelConfig, slider, timeControl, optionsGUI) {

    // set visibility
    if (modelConfig.showSlider) {

        slider.style.display = "block"

    } else {

        slider.style.display = "none"

    }

    // number of decimal places 

    // format object
    var numberFormat = {
        // 'to' the formatted value. Receives a number.
        to: function (value) {
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var month
            if (value < 12.) {
                var month = monthNames[Math.floor(value)]
            } else {
                month = "December"
            }
            return month;
        },
        // 'from' the formatted value.
        // Receives a string, should return a number.
        from: function (value) {
            return Number(value);;
        }
    };

    noUiSlider.create(slider, {
        start: timeControl.currentTime,
        tooltips:  [numberFormat], // tooltip with custom formatting,
        //format: numberFormat,
        range: {
            'min': modelConfig.timeMin,
            'max': modelConfig.timeMax
        },
        connect: 'lower',
        // pips: {
        //     mode: 'count',
        //     values: 6,
        //     density: 100
        // }
    });

    slider.noUiSlider.on('slide', function (values, handle) {

        timeControl.currentTime = values[handle]
  
    });

    slider.noUiSlider.on('click', function (values, handle) {

        timeControl.currentTime = values[handle]
  
    });
    
    slider.tickEachFrame = () => { 
        
        if (optionsGUI.timeAnimationOn) {

            slider.noUiSlider.set(timeControl.currentTime);

        }
    
      }

    return slider

}

function createDaySlider(loop, camera, renderer, scene, modelList, modelConfig, slider, timeControl, optionsGUI) {

    // set visibility
    if (modelConfig.showSlider) {

        slider.style.display = "block"

    } else {

        slider.style.display = "none"

    }

    // number of decimal places 

    // format object
    var numberFormat = {
        // 'to' the formatted value. Receives a number.
        to: function (value) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var month
            if (value < 330.) {
                var month = monthNames[Math.floor(value / 30.0)]
            } else {
                month = "Dec"
            }
            var day = Math.floor(value - Math.floor(value / 30.0) * 30.0 + 1.0 )
            return day+' '+month;
        },
        // 'from' the formatted value.
        // Receives a string, should return a number.
        from: function (value) {
            return Number(value);;
        }
    };

    noUiSlider.create(slider, {
        start: timeControl.currentTime,
        tooltips:  [numberFormat], // tooltip with custom formatting,
        //format: numberFormat,
        range: {
            'min': modelConfig.timeMin,
            'max': modelConfig.timeMax
        },
        connect: 'lower',
        // pips: {
        //     mode: 'count',
        //     values: 6,
        //     density: 100
        // }
    });

    slider.noUiSlider.on('slide', function (values, handle) {

        timeControl.currentTime = values[handle]
  
    });

    slider.noUiSlider.on('click', function (values, handle) {

        timeControl.currentTime = values[handle]
  
    });
    
    slider.tickEachFrame = () => { 
        
        if (optionsGUI.timeAnimationOn) {

            slider.noUiSlider.set(timeControl.currentTime);

        }
    
      }

    return slider

}

export { createPaleomapSlider, createMonthSlider, createDaySlider }