////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define uniforms
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
uniform float uOpacityClouds;
uniform float uFrameWeight;
uniform float uCloudsMinValue;
uniform float uCloudsMaxValue;
uniform sampler2D thisCloudsFrame;
uniform sampler2D nextCloudsFrame;
uniform sampler2D cloudsTexture;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// varying from vertex shader
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
varying vec2 vUv;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// remap color range
float remap(float value, float inMin, float inMax, float outMin, float outMax) {

    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);

}

// custom bicubic texture filtering as an alternative to the standard nearest neighbor and bilinear resampling
// more expensive, needs 4 bilinear lookups
// smoother results, but underestimates peak values (different for bilinear filtering)
// from https://stackoverflow.com/questions/13501081/efficient-bicubic-filtering-code-in-glsl

vec4 cubic(float v) {

    vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
    vec4 s = n * n * n;
    float x = s.x;
    float y = s.y - 4.0 * s.x;
    float z = s.z - 4.0 * s.y + 6.0 * s.x;
    float w = 6.0 - x - y - z;

    return vec4(x, y, z, w) * (1.0/6.0);

}

vec4 textureBicubic(sampler2D sampler, vec2 texCoords, float numLon, float numLat) {

    vec2 texSize = vec2(numLon, numLat);

    vec2 invTexSize = 1.0 / texSize;

    texCoords = texCoords * texSize - 0.5;

        vec2 fxy = fract(texCoords);
        texCoords -= fxy;

        vec4 xcubic = cubic(fxy.x);
        vec4 ycubic = cubic(fxy.y);

        vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;

        vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
        vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;

        offset *= invTexSize.xxyy;
        
        vec4 sample0 = texture2D(sampler, offset.xz);
        vec4 sample1 = texture2D(sampler, offset.yz);
        vec4 sample2 = texture2D(sampler, offset.xw);
        vec4 sample3 = texture2D(sampler, offset.yw);

        float sx = s.x / (s.x + s.y);
        float sy = s.z / (s.z + s.w);

        return mix(
        mix(sample3, sample2, sx), mix(sample1, sample0, sx)
        , sy);

    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main program
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void main()	{

// interpolate model data between two time steps
vec4 cloudsValueInt;

// standard bilinear interpolation
//cloudsValueInt = mix(texture2D(thisCloudsFrame,vUv),texture2D(nextCloudsFrame,vUv),uFrameWeight);
cloudsValueInt = mix(textureBicubic(thisCloudsFrame,vUv, 128.0, 64.0),textureBicubic(nextCloudsFrame,vUv, 128.0, 64.0),uFrameWeight);

float cloudsValueRemapped = remap( cloudsValueInt.r, uCloudsMinValue, uCloudsMaxValue, 0.0, 1.0 );

//vec4 colorClouds = texture2D( cloudsTexture, vUv * 2.0 );
vec4 colorClouds = vec4(0.9);

gl_FragColor = vec4(colorClouds.rgb, cloudsValueRemapped);
gl_FragColor.a *= uOpacityClouds;


}