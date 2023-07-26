uniform sampler2D uTexture;
uniform sampler2D uBitmapTexture;

varying vec2 vUv;

void main()
{
    vec4 textureColor = texture2D(uTexture, vUv).rgba;
    vec4 bitmapColor = texture2D(uBitmapTexture, vUv).rgba;

    vec3 mixColor = mix(bitmapColor.rgb, textureColor.rgb, textureColor.a);

    gl_FragColor = vec4(mixColor, 1.0);
}
