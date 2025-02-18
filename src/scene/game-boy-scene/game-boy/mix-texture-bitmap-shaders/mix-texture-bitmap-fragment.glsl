uniform sampler2D uVideoTexture;
uniform sampler2D uBitmapTexture;
uniform sampler2D uTexture;
uniform mat4 uColorMatrix;

varying vec2 vUv;

void main()
{
    vec3 videoColor = texture2D(uVideoTexture, vUv).rgb;
    vec4 bitmapColor = texture2D(uBitmapTexture, vUv).rgba;
    vec4 textureColor = texture2D(uTexture, vUv).rgba;

    vec3 mixVideo = mix(videoColor.rgb, bitmapColor.rgb, bitmapColor.a);
    vec3 mixColor = mix(mixVideo.rgb, textureColor.rgb, textureColor.a);

    vec4 finalColor = vec4(mixColor, 1.0);

    gl_FragColor = uColorMatrix * finalColor;
}
