uniform vec4 uGrid;
varying vec2 vUv;

void main() {
  vUv = uGrid.zw + uv * uGrid.xy;

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
}