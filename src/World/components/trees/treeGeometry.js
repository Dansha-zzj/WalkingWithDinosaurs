import { InstancedBufferGeometry, SphereGeometry, InstancedBufferAttribute, MeshPhysicalMaterial, BufferGeometry, Quaternion, Vector3, Object3D, Mesh, MeshBasicMaterial } from 'three';

function createTreeGeometry(baseGeometry, count, maxCount) {

    const geometry = new InstancedBufferGeometry();

    geometry.copy(baseGeometry);

    geometry.instanceCount = count 
    geometry.maxInstancedCount = maxCount

    // definition of common uniform and attributes   
    const positions = new Float32Array ( maxCount * 3) ; 
    const quaternions = new Float32Array ( maxCount * 4 ) ; 
    const gridUV = new Float32Array( maxCount * 2 );

    var ii = 0;
    var jj = 0;
    var kk = 0;

    for ( let i = 0; i < maxCount; i++ ){

        //random distribution on surface plane
        positions[ ii + 0 ] = ( Math.random() - 0.5 ) * 4.0 * 100.
        positions[ ii + 1 ] = 0.
        positions[ ii + 2 ] = ( ( Math.random() + Math.random() ) / 2.  - 0.5 ) * 1.98 * 100.
  //      positions[ ii + 2 ] = (  Math.random() - 0.5 ) * 1.98 * 100.

        //position on model grid for texture lookup
        gridUV[ jj + 0 ] = positions[ ii + 0 ] / 400. + 0.5
        gridUV[ jj + 1 ] = 1. - ( positions[ ii + 2 ] / 200. + 0.5 )

        //calculate respective positions on sphere for correct orientation
        const phi = Math.PI * 2. * gridUV[ jj + 0 ]
        const theta =  Math.PI * 1. * ( gridUV[ jj + 1 ] - 1. )

        const dummyMesh = new Mesh( baseGeometry, new MeshBasicMaterial );

        // mimic surface shader calculations for spherical coordinates
        dummyMesh.position.set( 
          100 * Math.sin(theta) * Math.sin(phi), 
          100 * Math.sin(theta) * Math.cos(phi),
          -1. * 100 * Math.cos(theta)
          );

        // orient trees along sphere normals, i.e. always looking upwards/outside of the globe
        dummyMesh.lookAt(0,0,0)
        dummyMesh.rotateX(-Math.PI / 2.);
        if (theta < - Math.PI/2.) {
          dummyMesh.rotateY(Math.PI);
        }

        // save quaternions (i.e. rotations) for each tree to later apply in the shader for globe view
        quaternions[ kk + 0 ] = dummyMesh.quaternion.x
        quaternions[ kk + 1 ] = dummyMesh.quaternion.y
        quaternions[ kk + 2 ] = dummyMesh.quaternion.z
        quaternions[ kk + 3 ] = dummyMesh.quaternion.w


        dummyMesh.geometry.computeVertexNormals()

        jj = jj + 2
        ii = ii + 3
        kk = kk + 4

        }

        geometry.setAttribute('positions', new InstancedBufferAttribute(positions, 3 ));
        geometry.setAttribute('gridUV', new InstancedBufferAttribute(gridUV, 2 ));
        geometry.setAttribute('quaternions', new InstancedBufferAttribute(quaternions, 4 ));

    return {geometry}

}

export {createTreeGeometry}