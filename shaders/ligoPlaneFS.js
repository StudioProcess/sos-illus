export default `
precision mediump float;

uniform sampler2D pingPongOutMap;

uniform float lineWeight;
uniform float lineSmoothness;

varying vec2 vUV;
varying float lineBase;

	
float cubicPulse( float c, float w, float x ) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0 - 2.0 * x);
}

void main()	{
  float alpha = mod(lineBase, 1.0);
  alpha *= cubicPulse(0.5, lineWeight, alpha);
  alpha *= lineSmoothness;

  alpha = min(1.0, alpha);

  gl_FragColor = vec4(vec3(1.0), alpha);
  // gl_FragColor = vec4(texture2D(pingPongOutMap, vUV).rgb, 1.0);
}`;