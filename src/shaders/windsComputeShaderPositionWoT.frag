uniform sampler2D windsThisDataFrame;
uniform sampler2D windsNextDataFrame;
uniform sampler2D thisHeightFrame;

uniform float uFrameWeight;
uniform float uSpeed;
uniform float uSpeedMax;
uniform float uDelta;
uniform float uRandSeed;
uniform float uDropRate;
uniform float uDropRateBump;
uniform float uWindsParticleLifeTime;
uniform float uSphereWrapAmount;
uniform float uHeightWinds;
uniform float uHeightDisplacement;
uniform float uWindsZonalDataMin;
uniform float uWindsZonalDataMax;
uniform float uWindsMeridionalDataMin;
uniform float uWindsMeridionalDataMax;
uniform float uWindsTopographyInfluence;

// remap function from RGB color to data value
float remap(float value, float inMin, float inMax, float outMin, float outMax) {

    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);

}

// pseudo-random generator (https://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl)
const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);

float rand(const vec2 co) {

    float t = dot(rand_constants.xy, co);
    return fract(sin(t) * (rand_constants.z + t));

}

vec3 getRandomPosition(vec2 seed, float decimal, float height) {

    return vec3 (
        (rand(seed + 1.0 + decimal) - 0.5) * 4.0,
        (rand(seed + 2.0 + decimal) - 0.5) * 1.98,
        // height
        height
    );   

} 



void main() {

    // divide screen space coordinates by viewport size to get UV texture coordinates in the range 0 to 1
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // look up particle position (texel) from texture
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 pos = tmpPos.xyz;

    // convert xy-plane position to UV texture coordinate [0,1]
    vec2 vc2D  = vec2 (pos.x / 4.0 + 0.5 - ( 1. / 128. / 2.0 ),  pos.y / 2.0 + 0.5 + ( 1. / 64. / 2.0 ) );

    vec4 intVelocities;
    float remappedU;
    float remappedV; 
    float remappedW; 

    // 2D surface velocity fields
    // look up model velocities at those UVs for both frame and apply linear interpolation between both based on uFrameWeight (calculated from selected time)
    intVelocities = mix(texture2D(windsThisDataFrame,vc2D),texture2D(windsNextDataFrame,vc2D),uFrameWeight);

    float height = texture2D(thisHeightFrame,vc2D).x;

    pos.z = ( height * uHeightDisplacement + 0.01 ) * uWindsTopographyInfluence;

    // remap velocities from RGB image value [0,1] to cm/s [-50,50 cm/s] 
    intVelocities.r = remap( intVelocities.r, 0.0, 1.0, uWindsZonalDataMin, uWindsZonalDataMax );
    intVelocities.g = remap( intVelocities.g, 0.0, 1.0, uWindsMeridionalDataMin, uWindsMeridionalDataMax );
    intVelocities.b = 0.0;

    // scale particle velocities
    vec3 vel;
    if ( length(intVelocities.rgb) < 1.5 * uSpeedMax ) {

        vel = intVelocities.rgb * uSpeed;

    } else {

        vel = intVelocities.rgb / ( length(intVelocities.rgb) / 1.5 / uSpeedMax ) * uSpeed;

    }

    // velocity disortion at higher latitudes; needs to be checked; from https://github.com/mapbox/webgl-wind/blob/master/src/shaders/update.frag.glsl
    if (vc2D.y > 0.001 && vc2D.y < 0.999) {
        if (uSphereWrapAmount > 0.5) {

            vel.x /= cos(radians(vc2D.y * 180.0 - 90.0)) * 2.;

        }
    }

    // Advance dynamics one time step
    pos += vel * uDelta / 3.0 ;

    if (pos.x > 2.0) {
        pos.x -= 4.0;
    }

    if (pos.x < -2.0) {
        pos.x += 4.0;
    }

    float age;

    // reset particle to random position if lifetime expires or it leaves northern or southern boundary
    if ( tmpPos.a > uWindsParticleLifeTime || pos.y >= .98 || pos.y <= -.98 ) {

        // get new random position
        // random reset of particle positions from from https://github.com/mapbox/webgl-wind/blob/master/src/shaders/update.frag.glsl
  
        // a random seed to use for the particle drop
        vec2 seed = (pos.xy + tmpPos.xy) * uRandSeed;
        
        pos = getRandomPosition(seed, 1.2, tmpPos.z);

        age = 0.;

    // otherwise increment time counter for particle
    } else {

        age = tmpPos.a + uDelta * 100.;

    }


   //     pos = mix(pos, random_pos, drop);

 //   if (pos.y >= 1.0 || pos.y <= -1.0 || heightValueInt.r >= 0.5) {
//    if (pos.y >= 1.0 || pos.y <= -1.0 || landMask >= 0.5 ) {
    // if (pos.y >= 1.0 || pos.y <= -1.0) {
    //     pos = random_pos;
    // }    

    // if (pos.y >= 1.0 || pos.y <= -1.0 || length(vel) <= 0.05 ) {
    //     pos = random_pos;
    // }    


    gl_FragColor = vec4( pos, age );

// no movement
//     gl_FragColor = tmpPos;
 


}