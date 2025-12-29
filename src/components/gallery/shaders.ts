/**
 * Shadery GLSL dostosowane do palety kolorystycznej projektu
 * - Liquid distortion effect
 * - Background noise shader
 * - Glow effect shader
 * 
 * Kolory projektu:
 * - Primary: hsl(186, 88%, 44%) - #13b8c4 (turkus/cyjan)
 * - Gold: hsl(45, 55%, 52%) - #c9a227
 * - Background: hsl(222, 47%, 6%) - #0d1117
 */

// Vertex shader podstawowy - używany przez wszystkie efekty
export const basicVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Liquid Distortion Shader - efekt płynnego zniekształcenia
export const liquidDistortionShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uMouse;
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  
  // Simplex noise funkcja
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Dystans od myszy dla interakcji
    float mouseDistance = distance(uv, uMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDistance) * 0.3;
    
    // Noise-based distortion
    float noise1 = snoise(vec3(uv * 3.0, uTime * 0.5));
    float noise2 = snoise(vec3(uv * 5.0 + 100.0, uTime * 0.3));
    
    // Zniekształcenie UV
    vec2 distortion = vec2(noise1, noise2) * uIntensity * (1.0 + mouseInfluence);
    vec2 distortedUv = uv + distortion * 0.02;
    
    vec4 color = texture2D(uTexture, distortedUv);
    gl_FragColor = color;
  }
`;

// Background Noise Shader - gradient z szumem w kolorach projektu
export const backgroundNoiseShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  // Kolory projektu
  const vec3 navy = vec3(0.051, 0.067, 0.090);      // #0d1117 - background
  const vec3 navyLight = vec3(0.078, 0.102, 0.137); // #141b23 - card
  const vec3 gold = vec3(0.788, 0.635, 0.153);      // #c9a227 - gold
  const vec3 primary = vec3(0.075, 0.722, 0.769);   // #13b8c4 - primary/cyan
  
  // Prosty hash noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  
  // Value noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // FBM (Fractal Brownian Motion)
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Animowany noise
    float n = fbm(uv * 4.0 + uTime * 0.1);
    float n2 = fbm(uv * 8.0 - uTime * 0.05);
    
    // Gradient bazowy - od navy do navyLight
    vec3 baseGradient = mix(navy, navyLight, uv.y * 0.5 + n * 0.2);
    
    // Delikatne plamy złotego i primary koloru
    float goldMask = smoothstep(0.4, 0.6, n) * smoothstep(0.5, 0.3, n2);
    float primaryMask = smoothstep(0.5, 0.7, n2) * smoothstep(0.6, 0.4, n);
    
    vec3 finalColor = baseGradient;
    finalColor = mix(finalColor, gold, goldMask * 0.08);
    finalColor = mix(finalColor, primary, primaryMask * 0.06);
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.8;
    finalColor *= vignette;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Glow Effect Shader - dla efektów poświaty wokół elementów
export const glowShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  uniform sampler2D uTexture;
  
  varying vec2 vUv;
  
  void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Blur dla efektu glow
    float blur = 0.005 * uIntensity;
    vec4 blurred = vec4(0.0);
    
    for (float x = -2.0; x <= 2.0; x += 1.0) {
      for (float y = -2.0; y <= 2.0; y += 1.0) {
        vec2 offset = vec2(x, y) * blur;
        blurred += texture2D(uTexture, vUv + offset);
      }
    }
    blurred /= 25.0;
    
    // Pulsująca intensywność
    float pulse = 0.8 + 0.2 * sin(uTime * 2.0);
    
    // Łączenie koloru glow z teksturą
    vec3 glowColor = uColor * blurred.rgb * pulse;
    vec3 finalColor = texColor.rgb + glowColor * uIntensity;
    
    gl_FragColor = vec4(finalColor, texColor.a);
  }
`;

// Particle Shader - dla efektu cząsteczek
export const particleVertexShader = `
  attribute float aScale;
  attribute float aRandomness;
  
  uniform float uTime;
  uniform float uSize;
  
  varying float vAlpha;
  
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Animowany ruch cząsteczek
    float offset = uTime * 0.5 + aRandomness * 10.0;
    modelPosition.y += sin(offset) * 0.2;
    modelPosition.x += cos(offset * 0.5) * 0.1;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);
    
    // Alpha fade based on position
    vAlpha = 0.5 + 0.5 * sin(uTime + aRandomness * 6.28);
  }
`;

export const particleFragmentShader = `
  uniform vec3 uColor;
  
  varying float vAlpha;
  
  void main() {
    // Okrągłe cząsteczki z soft edge
    float distanceToCenter = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.2, distanceToCenter) * vAlpha;
    
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// Eksport kolorów projektu jako vec3 dla shaderów
export const shaderColors = {
  navy: 'vec3(0.051, 0.067, 0.090)',
  navyLight: 'vec3(0.078, 0.102, 0.137)',
  gold: 'vec3(0.788, 0.635, 0.153)',
  goldLight: 'vec3(0.847, 0.702, 0.322)',
  primary: 'vec3(0.075, 0.722, 0.769)',
  white: 'vec3(0.902, 0.929, 0.953)',
};

// Alias dla kompatybilności
export const baseVertexShader = basicVertexShader;

export default {
  basicVertexShader,
  baseVertexShader,
  liquidDistortionShader,
  backgroundNoiseShader,
  glowShader,
  particleVertexShader,
  particleFragmentShader,
  shaderColors,
};
