#define M_PI 3.14159265

uniform float wrapAmountUniform;
uniform float uHeightDisplacement;

attribute vec3 positions;

varying vec3 vUv;

vec4 anglesToSphereCoord(vec2 a, float r)
{
    return vec4(
        r * sin(a.y) * sin(a.x),
        r * cos(a.y),
        r * sin(a.y) * cos(a.x) * - 1.0 ,
        1.0
    );
}

vec3 anglesToSphereCoord2(vec2 a, float r) {

    return vec3(
        r * sin(a.y) * sin(a.x),
        r * cos(a.y),
        r * sin(a.y) * cos(a.x)  
    );

}

void main()
{
    /**
    * Position
    */

	vec3 pos = position + positions;

/*     // previous plane/sphere transition
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = modelViewMatrix * vec4(pos, 1.0) ;
    float scale = 1.;
 //   viewPosition.xyz += positions * scale;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition; */

/* 	  vec3 pos = position + positions;


      vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * modelViewPosition * 0.01;

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
    mvPosition.xyz += pos * scale;
    vUv = uv;
    gl_Position = projectionMatrix * mvPosition;  */

    //position += positions;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
    
}