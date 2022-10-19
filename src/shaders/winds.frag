precision highp float;

uniform float uWindsParticleOpacity;

varying vec4 vColor;

void main()
{

   gl_FragColor = vColor * uWindsParticleOpacity;

}

