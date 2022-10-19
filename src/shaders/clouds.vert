////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define uniforms
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
#define M_PI 3.14159265

uniform float uSphereWrapAmount;
uniform float uHeightClouds;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// varying for fragment shader
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
varying vec2 vUv;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

vec3 anglesToSphereCoord(vec2 a, float r) {

    return vec3(
        r * sin(a.y) * sin(a.x),
        r * cos(a.y),
        r * sin(a.y) * cos(a.x)  
    );

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main program
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void main()	{

    vec3 modPosition = position;

    modPosition.z += uHeightClouds;

    vec2 angles = M_PI * vec2(2. * uv.x, uv.y - 1.);

    // calculate sphere position with radius increased by calculated z displacement
    vec3 sphPos = anglesToSphereCoord(angles, 1.0 + uHeightClouds );

    // mix plane and sphere position 
    vec3 wrapPos = mix(modPosition, sphPos, uSphereWrapAmount);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4( wrapPos, 1.0 );

    vUv = uv;
}