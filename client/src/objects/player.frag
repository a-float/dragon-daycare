uniform float hueShift;
uniform sampler2D map; 
varying vec2 vUv;

vec3 HueShift(vec3 Color, float Shift) {
    vec3 P = vec3(0.55735) * dot(vec3(0.55735), Color);
    
    vec3 U = Color - P;
    
    vec3 V = cross(vec3(0.55735), U);    

    Color = U*cos(Shift*6.2832) + V*sin(Shift*6.2832) + P;
    
    return vec3(Color);
}

void main() {
  // gl_FragColor = vec4(mix(colorA, colorB, vUv.z), 1.0);
  vec4 mapColor = texture(map, vUv.xy);

  gl_FragColor = vec4(HueShift(mapColor.rgb, hueShift), mapColor.a);
}
