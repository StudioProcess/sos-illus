export default `
precision mediump float;

uniform float lineStepSize;
uniform float lineWeight;
uniform float lineSmoothing;

uniform float facingCull;
uniform float facingCullWidth;

uniform float outerOpacity;
uniform float innerOpacity;

varying float vHeightVal;
varying float facing;


float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

void main() {
  float alpha = mod(vHeightVal, lineStepSize);
  alpha /= lineStepSize;

  alpha *= cubicPulse(0.5, lineWeight / lineStepSize, alpha);
  alpha *= lineSmoothing;
  alpha = min(1.0, alpha);

  alpha *= smoothstep(facingCull - facingCullWidth, facingCull + facingCullWidth, facing);

#if defined( INNER)
    gl_FragColor = vec4(vec3(2.0), alpha * innerOpacity);
  #else
    gl_FragColor = vec4(vec3(1.0), alpha * outerOpacity);
  #endif
}
`;