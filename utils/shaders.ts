
export const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
  }
`;

export const selectionGlowVertexShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position; // Pasamos la posición local para el efecto de escaneo
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const selectionGlowFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Rim light effect (Borde brillante)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Asumimos vista frontal aproximada en espacio de vista
    float intensity = pow(0.6 - dot(vNormal, viewDir), 4.0);
    
    // Scanline effect (Líneas horizontales bajando)
    float scanline = sin(vPosition.y * 10.0 - uTime * 4.0);
    scanline = smoothstep(0.8, 1.0, scanline) * 0.5;
    
    // Color base Cyan/Electric Blue
    vec3 color = vec3(0.0, 1.0, 1.0);
    
    // Combinar borde + escaneo + base tenue
    float alpha = intensity + scanline + 0.1;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

export const starVertexShader = `
  attribute float aRandom;
  uniform float uTime;
  uniform float uSize;
  varying float vAlpha;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = uSize;
    float twinkle = sin(uTime * 2.0 + aRandom * 100.0);
    vAlpha = 0.65 + 0.35 * twinkle;
  }
`;

export const starFragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    if(length(coord) > 0.5) discard;
    gl_FragColor = vec4(uColor, vAlpha);
  }
`;
