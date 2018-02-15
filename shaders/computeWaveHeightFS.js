const computeHeightFS = `
precision mediump float;

uniform sampler2D pingPongInMap;

uniform vec3 pointPositions[NUM_POINTS];
uniform float aspectRatio;
uniform vec2 computeResolution;

uniform float attack;
uniform float decay;
uniform float engeryReduce;

uniform float dotEffect;

uniform float pointSize;

uniform float cornerEffect;
uniform float averageDivider;

varying vec2 vUV;

void main()
{
  vec4 prevData = texture2D(pingPongInMap, vUV);

  // prevData.r = 1.0 - prevData.r;

  float prevHeight = prevData.r;
  float prevVel = prevData.g;

  vec2 uvXOffset = vec2(computeResolution.x / aspectRatio, 0.0);
  vec2 uvYOffset = vec2(0.0, computeResolution.y);

  float l = texture2D(pingPongInMap, vUV - uvXOffset).r;
  float r = texture2D(pingPongInMap, vUV + uvXOffset).r;
  float t = texture2D(pingPongInMap, vUV + uvYOffset).r;
  float b = texture2D(pingPongInMap, vUV - uvYOffset).r;

  float outerAverage = l + r + t + b;

  outerAverage += texture2D(pingPongInMap, vUV + uvYOffset - uvXOffset).r * cornerEffect; // TL
  outerAverage += texture2D(pingPongInMap, vUV + uvYOffset + uvXOffset).r * cornerEffect; // TR
  outerAverage += texture2D(pingPongInMap, vUV - uvYOffset - uvXOffset).r * cornerEffect; // BL
  outerAverage += texture2D(pingPongInMap, vUV - uvYOffset + uvXOffset).r * cornerEffect; // BR

  outerAverage /= averageDivider;

  prevData.r += (prevVel + (attack * (outerAverage - prevData.r))) * decay;
  prevData.r *= engeryReduce;

  vec2 dist;
  for (int i = 0; i < NUM_POINTS; i++) {
    dist.x = vUV.x - pointPositions[i].x;
    dist.y = vUV.y - pointPositions[i].y;

    dist.x *= aspectRatio;

    dist /= pointSize;

    dist.x *= dist.x;
    dist.y *= dist.y;

    prevData.r += pointPositions[i].z * mix(
      dotEffect,
      0.0,
      clamp(dist.x + dist.y, 0.0, 1.0)
    );
  }

  vec3 norm;
  norm.x = l - r;
  norm.y = b - t;
  norm.z = 2.0;
  norm = normalize(norm);

  prevData.g = (prevData.r - prevHeight); // velocity

  // prevData.b = norm.x; // y normal
  // prevData.a = norm.y; // y normal

	gl_FragColor = vec4(prevData.rg, norm);
}
`;