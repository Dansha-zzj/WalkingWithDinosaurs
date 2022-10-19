import { CanvasTexture, RepeatWrapping, RedFormat, LinearFilter, NearestFilter, EquirectangularReflectionMapping   } from 'three';
import { putFrameToCanvas } from './updateCanvas.js';

function textureFromCanvas(dataImage, filter, frame) {
    
    const canvas=document.createElement('canvas')

    if (dataImage.height == 73) {

        canvas.height = 73
        canvas.width = 96

    } else if (dataImage.height == 72) {

        canvas.height = 72
        canvas.width = 96

    } else if (dataImage.height == 91) {

        canvas.height = 91
        canvas.width = 181

    } else if (dataImage.height == 64) {

        canvas.height = 64
        canvas.width = 128

    } else if (dataImage.height == 181) {

        canvas.height = 181
        canvas.width = 360

    } else if (dataImage.height == 180) {

        canvas.height = 180
        canvas.width = 360

    } else if (dataImage.height == 90) {

        canvas.height = 90
        canvas.width = 180

    }  else if (dataImage.height == 144) {

        canvas.height = 144
        canvas.width = 192

    } else if (dataImage.height == 720) {

        canvas.height = 720
        canvas.width = 1440

    } else if (dataImage.height == 323) {

        canvas.height = 323
        canvas.width = 432

    } else if (dataImage.height == 320) {

    canvas.height = 320
    canvas.width = 432

}

    const texture = new CanvasTexture(canvas);

    if(filter === 'LinearFilter') {
        texture.magFilter = LinearFilter
        texture.minFilter = LinearFilter
    } else if(filter === 'NearestFilter') {
        texture.magFilter = NearestFilter
        texture.minFilter = NearestFilter
    }
    
    texture.generateMipmaps = false; 

//    texture.wrapS = RepeatWrapping; 
//   texture.format = RedFormat

    texture.wrapS = texture.wrapT = RepeatWrapping

    putFrameToCanvas(dataImage, texture, frame, canvas)

    return texture
  }

  export { textureFromCanvas };