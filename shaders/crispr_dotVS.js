const crispr_dotVS = `
precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

uniform vec3 point0;
uniform vec3 point1;
uniform vec3 point2;

uniform float offsetDistance;

uniform float windings;

attribute vec2 position;
attribute float normId;

const float PI = 3.14159265359; 

vec3 Spline(vec3 p1, vec3 p2, vec3 p3, float value) {
	vec3 one = mix(p1, p2, value);
	vec3 two = mix(p2, p3, value);

  return mix(one, two, value);
}

vec4 quat_from_axis_angle(vec3 axis, float angle)
{ 
  vec4 qr;
  float half_angle = (angle * 0.5) * 3.14159 / 180.0;
  qr.x = axis.x * sin(half_angle);
  qr.y = axis.y * sin(half_angle);
  qr.z = axis.z * sin(half_angle);
  qr.w = cos(half_angle);
  return qr;
}

vec4 quat_conj(vec4 q)
{ 
  return vec4(-q.x, -q.y, -q.z, q.w); 
}
  
vec4 quat_mult(vec4 q1, vec4 q2)
{ 
  vec4 qr;
  qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
  qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
  qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
  qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
  return qr;
}

vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle)
{ 
  vec4 qr = quat_from_axis_angle(axis, angle);
  vec4 qr_conj = quat_conj(qr);
  vec4 q_pos = vec4(position.x, position.y, position.z, 0);
  
  vec4 q_tmp = quat_mult(qr, q_pos);
  qr = quat_mult(q_tmp, qr_conj);
  
  return vec3(qr.x, qr.y, qr.z);
}

void main()	{
  vec4 transformed = vec4(1.0);
  transformed.xyz = Spline(
    point0,
    point1,
    point2,
    normId
  );

  #if defined( OFFSET_DOT )
  vec3 forwardV = Spline(
    point0,
    point1,
    point2,
    normId + 0.05
  );

  forwardV = normalize(transformed.xyz - forwardV);
  vec3 offsetU = cross(forwardV, vec3(0.0, 1.0, 0.0));
  vec3 offsetV = cross(forwardV, offsetU);

  float angle = time + normId * windings;

  transformed.xyz += (sin(angle) * offsetDistance) * offsetV;
  transformed.xyz += (cos(angle) * offsetDistance) * offsetU;
  #endif

  transformed = modelViewMatrix * transformed;
  transformed.xy += position.xy * transformed.w;

	gl_Position = projectionMatrix * transformed;
	// gl_Position = vec4(position, 0.0, 1.0);
}`;