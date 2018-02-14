const computeHeightFS = `
precision mediump float;

uniform sampler2D pingPongInMap;

uniform vec3 pointPositions[NUM_POINTS];
uniform float aspectRatio;
uniform vec2 computeResolution;

uniform float attack;
uniform float decay;

uniform float pointSize;

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

  outerAverage += texture2D(pingPongInMap, vUV + uvYOffset - uvXOffset).r * 0.75; // TL
  outerAverage += texture2D(pingPongInMap, vUV + uvYOffset + uvXOffset).r * 0.75; // TR
  outerAverage += texture2D(pingPongInMap, vUV - uvYOffset - uvXOffset).r * 0.75; // BL
  outerAverage += texture2D(pingPongInMap, vUV - uvYOffset + uvXOffset).r * 0.75; // BR

  outerAverage /= 7.0;

  prevData.r += (prevVel + (2.0 * (outerAverage - prevData.r))) * 0.99;
  prevData.r *= 0.995;

  vec2 dist;
  for (int i = 0; i < NUM_POINTS; i++) {
    dist.x = vUV.x - pointPositions[i].x;
    dist.y = vUV.y - pointPositions[i].y;

    dist.x *= aspectRatio;

    dist /= pointSize;

    dist.x *= dist.x;
    dist.y *= dist.y;

    prevData.r += mix(
      3.0,
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

  prevData.b = norm.y; // y normal

	gl_FragColor = vec4(prevData.rgb, 1.0);
}
`;