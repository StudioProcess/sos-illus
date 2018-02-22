export default `
precision mediump float;

uniform float lineStepSize;
uniform float lineWeight;
uniform float lineSmoothing;

uniform float facingCull;
uniform float facingCullWidth;

uniform float outerOpacity;
uniform float innerOpacity;

uniform vec3 outerColor0;
uniform vec3 outerColor1;

uniform vec3 innerColor0;
uniform vec3 innerColor1;

varying float vHeightVal;
varying float vDisplaceNorm;
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

  vec3 color;

#if defined( INNER)
    color = mix(
      innerColor0,
      innerColor1,
      vDisplaceNorm
    );

    alpha *= innerOpacity;
  #else
    color = mix(
      outerColor0,
      outerColor1,
      vDisplaceNorm
    );
    
    alpha *= outerOpacity;
  #endif

  gl_FragColor = vec4(color, alpha);
}
`;