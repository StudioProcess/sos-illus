export default `
precision mediump float;

uniform sampler2D pingPongOutMap;

uniform float time;

uniform float displaceGain;
uniform float displaceHeight;

uniform float numLines;

uniform vec2 uvScale;
uniform float uvRotation;
uniform vec2 uvTranslate;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUV;

varying float lineBase;

float gain(float x, float k) 
{
    float a = 0.5 * pow(2.0 * ((x<0.5) ? x : 1.0-x), k);
    return (x<0.5) ? a : 1.0 - a;
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

void main()	{

  vUV = uv;

  vUV -= 0.5;
  vUV *= uvScale;
  vUV = rotate(vUV, uvRotation);
  vUV -= uvTranslate;
  vUV += 0.5;

  lineBase = uv.x * numLines;

  vec3 vPosition = position;

  vec4 waveData = texture2D(pingPongOutMap, vUV);

  vPosition.z += displaceHeight * waveData.x * gain(abs(waveData.x), displaceGain);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}`;