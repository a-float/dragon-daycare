uniform sampler2D uMap; 
varying vec2 vUv;

void main() {
  vec4 mapColor = texture(uMap, vUv.xy);

  gl_FragColor = vec4(mapColor.rgba);
  // gl_FragColor = vec4(vUv.r, vUv.g, 0, 1);
}
