uniform sampler2D oceanCurrentsThisDataFrame;
uniform sampler2D oceanCurrentsNextDataFrame;
uniform sampler2D thisHeightFrame;
uniform sampler2D nextHeightFrame;

uniform float uFrameWeight;
uniform float uSpeed;
uniform float uOceanParticleVerticalSpeedup;
uniform float uOceanParticleDepthSpeedup;
uniform float uOceanParticleMinDepth;
uniform float uOceanParticleMaxDepth;
uniform float uDelta;
uniform float uRandSeed;
uniform float uDropRate;
uniform float uDropRateBump;
uniform float uSpeedMax;
uniform float uHeightDisplacement;
uniform float uOceanParticleLifeTime;
uniform float uSphereWrapAmount;

float maximumDepth = 6000.0;
uniform float[20] uOceanDepthLevels;

uniform bool uOceanEnable3D;
uniform bool uColorUpwelling;

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

vec3 getRandomPosition(vec2 seed, float decimal) {

    // if (uSphereWrapAmount >= 0.5) {

    //     return vec3 (
    //         (rand(seed + 1.0 + decimal) - 0.5) * 4.0,
    //         ( ( rand(seed + 1.0 + 2. * decimal) + rand(seed + 2.0 + decimal) ) / 2. - 0.5) * 1.98,
    //             0.001 
    //     );   

    // } else {

        return vec3 (
            (rand(seed + 1.0 + decimal) - 0.5) * 4.0,
            (rand(seed + 2.0 + decimal) - 0.5) * 1.98,
            0.001
        );   

    // }

} 



void main() {

    // divide screen space coordinates by viewport size to get UV texture coordinates in the range 0 to 1
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // look up particle position (texel) from texture
    vec4 tmpPos = texture2D( texturePosition, uv );
    vec3 pos = tmpPos.xyz;

    // convert xy-plane position to UV texture coordinate [0,1]
    vec2 vc2D  = vec2 (pos.x / 4.0 + 0.5 ,  pos.y / 2.0 + 0.5 );

    vec4 intVelocities;
    float remappedU;
    float remappedV; 
    float remappedW; 

    // 2D surface velocity fields
    // look up model velocities at those UVs for both frame and apply linear interpolation between both based on uFrameWeight (calculated from selected time)
    intVelocities = mix(texture2D(oceanCurrentsThisDataFrame,vc2D),texture2D(oceanCurrentsNextDataFrame,vc2D),uFrameWeight);

    float landMask = intVelocities.b;

    // remap velocities from RGB image value [0,1] to cm/s [-50,50 cm/s] 
    intVelocities.r = remap( intVelocities.r, 0.0, 1.0, -50.0, 50.0 );
    intVelocities.g = remap( intVelocities.g, 0.0, 1.0, -50.0, 50.0 );
    // intVelocities.r = remap( intVelocities.r, 0.0, 1.0, -100.0, 100.0 );
    // intVelocities.g = remap( intVelocities.g, 0.0, 1.0, -100.0, 100.0 );
    intVelocities.b = 0.0;

    // scale particle velocities
    vec3 vel = intVelocities.rgb * uSpeed;

    // velocity disortion at higher latitudes; needs to be checked; from https://github.com/mapbox/webgl-wind/blob/master/src/shaders/update.frag.glsl
   if (vc2D.y > 0.01 && vc2D.y < 0.99) {
     vel.x /= cos(radians(vc2D.y * 180.0 - 90.0));
   }

    // Advance dynamics one time step
    pos += vel * uDelta / 10.0 ;

    if (pos.x > 2.0) {
        pos.x -= 4.0;
    }

    if (pos.x < -2.0) {
        pos.x += 4.0;
    }

    float age;

    // reset particle to random position if lifetime expires or it leaves northern or southern boundary
    if ( tmpPos.a > uOceanParticleLifeTime || pos.y >= 1.0 || pos.y <= -1.0 ) {

        // get new random position
        // random reset of particle positions from from https://github.com/mapbox/webgl-wind/blob/master/src/shaders/update.frag.glsl
  
        // a random seed to use for the particle drop
        vec2 seed = (pos.xy + tmpPos.xy) * uRandSeed;

        vec3 random_pos;
        
        for(int i = 0; i < 20; i++){

            random_pos = getRandomPosition(seed, 0. + float(i) / 10.);

            vec2 vc2DRandom  = vec2 (random_pos.x / 4.0 + 0.5 - ( 1. / 96. / 2.0 ),  random_pos.y / 2.0 + 0.5 + ( 1. / 73. / 2.0 ) );
            vec4 intVelocitiesRandom = mix(texture2D(oceanCurrentsThisDataFrame,vc2DRandom),texture2D(oceanCurrentsNextDataFrame,vc2DRandom),uFrameWeight);

            if (intVelocitiesRandom.b <= 0.5) {

                break;

            }

        }

        pos = random_pos;
        age = 0.;

    // otherwise increment time counter for particle
    } else {

        // fade out and reset particles close to coastline (i.e. at points dmissing velocities) faster
        // realised via a penalty function that lets time go faster depending on value of landMask
        float landPenalty = landMask * 0.01 * uOceanParticleLifeTime;

        age = tmpPos.a + 1. + landPenalty;

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