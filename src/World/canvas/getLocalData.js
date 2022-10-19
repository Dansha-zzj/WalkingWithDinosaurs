function findLocalModelData(imgData, lon, lat) {

    const canvas=document.createElement('canvas')

    //CMIP6 data
    var numLon = 180 
    var numLat = 90

    var lonPixel = Math.round((lon + 180) / 360 * numLon)
    var latPixel = 90 - Math.round((lat + 90) / 180 * numLat)
    
    var yearStart = 1950;
    var yearEnd = 2100;

    var arr = [];

    const average = (array) => array.reduce((a, b) => a + b) / array.length;

    var index = 0
    while(yearStart < yearEnd+1){

        canvas.getContext('2d').drawImage(imgData, numLon * index, 0, numLon , numLat, 0, 0, numLon, numLat);

        var pixelData = canvas.getContext('2d').getImageData(lonPixel - 1, latPixel - 1, 3, 3).data;

        //remove alpha channel
        pixelData = pixelData.filter(function(_, i) {
            return (i + 1) % 4;
          })

        var tempData = -2 + average(pixelData) / 255 * 20

        arr.push( {

            year: yearStart++,
            value: tempData
        
        } );

        index += 1

    }

    return arr

  }

  export {findLocalModelData}