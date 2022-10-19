precision highp float;

uniform float uOceanParticleOpacity;

varying vec4 vColor;

void main()
{

   gl_FragColor = vColor * uOceanParticleOpacity;

}

