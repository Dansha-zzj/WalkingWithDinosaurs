function putFrameToCanvas(imgData, newFrameTexture, frame, canvas) {

    let cNewFrame=canvas.getContext('2d')

    cNewFrame.drawImage(imgData, canvas.width * (frame), 0, canvas.width , canvas.height, 0, 0, canvas.width, canvas.height);
    newFrameTexture.needsUpdate = true;

  }

export { putFrameToCanvas };