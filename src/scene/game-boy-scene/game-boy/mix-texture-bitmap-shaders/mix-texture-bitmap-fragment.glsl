uniform sampler2D uTexture;
uniform sampler2D uBitmapTexture;

varying vec2 vUv;

void main()
{
    vec3 textureColor = texture2D(uTexture, vUv).rgb;
    vec4 bitmapColor = texture2D(uBitmapTexture, vUv).rgba;

    vec3 mixColor = mix(textureColor.rgb, bitmapColor.rgb, bitmapColor.a);

    gl_FragColor = vec4(mixColor, 1.0);
}
