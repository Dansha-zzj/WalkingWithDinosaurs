class Resizer {
  constructor(container, camera, renderer, shaderUniforms, scene) {

    this.container = container
    this.camera = camera
    this.renderer = renderer
    this.scene = scene

    this.setSize = () => {
      this.camera.aspect = (this.container.clientWidth) / this.container.clientHeight;
      this.camera.updateProjectionMatrix();
    
      //renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setSize((this.container.clientWidth), this.container.clientHeight);
      // call renderer directly after setSize to avoid screen flickering
      // https://stackoverflow.com/questions/17779134/how-do-you-resize-a-canvas-without-flicker
      this.renderer.render(scene, camera);

      // Set maxmimum pixel ratio to 2 to improve performance on highDPI devices
      let pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.renderer.setPixelRatio(pixelRatio);
    
      shaderUniforms.uPixelRatio.value = pixelRatio
    
    }; 

    // set initial size
    this.setSize(this.container, this.camera , this.renderer);

    new ResizeObserver( () => {

      this.setSize(this.container, this.camera, this.renderer);

    }).observe(container); 

    
  }

  takeScreenshot( ) {

    var width = this.container.clientWidth * 2.
    var height = this.container.clientHeight * 2.

    // set camera and renderer to desired screenshot dimension
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(  width, height );
  
    this.renderer.render( this.scene, this.camera, null, false );

    var imgData, imgNode;

    try {
        var strMime = "image/jpeg";
        imgData = this.renderer.domElement.toDataURL( strMime )

        var strDownloadMime = "image/octet-stream";
        saveFile(imgData.replace(strMime, strDownloadMime), "climatearchive_screenshot.jpg");

    } catch (e) {
        console.log(e);
        return;
    }

    // reset to old dimensions by invoking the on window resize function
    this.setSize(this.container, this.camera , this.renderer);
    
    function saveFile (strData, filename) {
      var link = document.createElement('a');
      if (typeof link.download === 'string') {
          document.body.appendChild(link); //Firefox requires the link to be in the body
          link.download = filename;
          link.href = strData;
          link.click();
          document.body.removeChild(link); //remove the link when done
      } else {
          location.replace(uri);
      }
  }
  
 }

}

export { Resizer };
