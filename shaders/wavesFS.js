const wavesFS = `
precision mediump float;

uniform sampler2D pingPongOutMap;

varying vec2 vUV;

void main()
{
  vec4 heightData = texture2D(pingPongOutMap, vUV);

  vec4 color = vec4(1.0);

  color.r = 0.5 + heightData.a * 0.5;
  color.g = color.r;
  color.b = color.r;

	gl_FragColor = color;
}
`;