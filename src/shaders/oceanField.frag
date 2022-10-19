////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define uniforms
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
uniform float uOpacityOcean;
uniform float uOpacityOceanBase;
uniform float uOpacityOceanOverlay;
uniform float uFrameWeight;
uniform float uOceanBaseMinValue;
uniform float uOceanBaseMaxValue;
uniform float uOceanOverlayMinValue;
uniform float uOceanOverlayMaxValue;
uniform float uDarkerOcean;
uniform float uHeightDisplacement;
uniform float uHeightGridXOffset;

uniform sampler2D thisBaseFrame;
uniform sampler2D nextBaseFrame;
uniform sampler2D thisOverlayFrame;
uniform sampler2D nextOverlayFrame;
uniform sampler2D thisHeightFrame;
uniform sampler2D nextHeightFrame;
uniform sampler2D colorMapBase;
uniform sampler2D iceTexture;

// uniform sampler2D colorMapOverlay;
uniform bool uTransparentSeaIce;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// varying from vertex shader
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
varying vec2 vUv;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// define functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// convert float to color via colormap
vec4 applyColormap(float t, sampler2D colormap){
    return(texture2D(colormap,vec2(t,0.5)));
}


// remap color range
float remap(float value, float inMin, float inMax, float outMin, float outMax) {

    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// main program
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

void main()	{

// interpolate model data between two time steps
vec4 baseValueInt;
vec4 overlayValueInt;
vec4 heightValueInt;

vec2 uvShifted = vUv;
uvShifted.x += 0.00725;  


baseValueInt = mix(texture2D(thisBaseFrame,uvShifted),texture2D(nextBaseFrame,uvShifted),uFrameWeight);
overlayValueInt = mix(texture2D(thisOverlayFrame,uvShifted),texture2D(nextOverlayFrame,uvShifted),uFrameWeight);

vec2 uvShiftedHeight = vUv;
uvShiftedHeight.x += uHeightGridXOffset;  

heightValueInt = mix(texture2D(thisHeightFrame,uvShiftedHeight),texture2D(nextHeightFrame,uvShiftedHeight),uFrameWeight);

float baseValueExpanded = remap( baseValueInt.r, 0.0, 1.0, -2.0, 42.0 );
//float overlayValueExpanded = remap( overlayValueInt.r, 0.0, 1.0, 0.0, 1.0 );

float baseValueRemapped = remap( baseValueExpanded, uOceanBaseMinValue, uOceanBaseMaxValue, 0.0, 1.0 );
//float overlayValueRemapped = remap( overlayValueExpanded, uOceanOverlayMinValue, uOceanOverlayMaxValue, 0.0, 1.0 );

// convert data value to color
vec4 baseColor = applyColormap( baseValueRemapped, colorMapBase );

if (uTransparentSeaIce) {

    vec4 iceColor = texture2D( iceTexture, vUv * 10.0 );

    gl_FragColor = mix(baseColor, iceColor, overlayValueInt.r * 1.4);

} else {

    gl_FragColor = baseColor;

}

// if (baseValueInt.g == .0) {
//     gl_FragColor.a = 0.
// }

// if(baseValueInt.g >= .5 && uHeightDisplacement == 0.0) {
//     gl_FragColor.a *= (1. - baseValueInt.g );
// }

if(heightValueInt.r >= .5 ) {
    gl_FragColor.a *= 0.;
}

gl_FragColor.rgb *= ( 1. - uDarkerOcean * 0.15);
gl_FragColor.a *= uOpacityOceanBase * uOpacityOcean * ( 1.0 - step( 1., baseValueInt.g ) );

}