import { TextureLoader, RepeatWrapping, LinearFilter } from 'three'

async function loadTexture2Uniform(filename) {

    const loader = new TextureLoader();

    const texture = await loader.loadAsync(filename)

    texture.magFilter = LinearFilter
    texture.minFilter = LinearFilter

    texture.generateMipmaps = false; 

    texture.wrapS = texture.wrapT = RepeatWrapping

    return texture;

}


export { loadTexture2Uniform };