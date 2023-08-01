varying vec2 vUv;

uniform float uTime;
uniform vec3 color01;
uniform vec3 color02;

void main()
{
    float uAngle = 0.0;
    vec2 direction = vec2(cos(uAngle), sin(uAngle));
    float dotValue = dot(vUv, direction);
    float gradientOffset = (dotValue + 1.0) * 0.5;

    // vec3 color = mix(color01, color02, vUv.x);
    vec3 color = mix(color01, color02, gradientOffset);

    gl_FragColor = vec4(color, 1.0);
}
