uniform vec4 uGrid;
varying vec2 vUv;

void main() {
  vec2 localUv = uv * uGrid.xy + uGrid.zw;
  vUv = vec2(localUv.x, 1.0 - localUv.y);

  // localUv.y = 1.0 - localUv.y;
  // vUv = localUv * 0.5;
  // vUv = vec2(localUv.x * uGrid.x, localUv.y * uGrid.y);
  // vUv.y = 1.0 - vUv.y;
  // vUv = position.xy;

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;
}