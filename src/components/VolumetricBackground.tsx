import { useEffect, useRef, useCallback } from "react";

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uTime;

  // Simplex-inspired noise (cheap)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

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

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 pos = uv * aspect;
    vec2 mouse = uMouse * aspect;

    // Base: slightly lighter charcoal (subtle lift)
    float vignette = 1.0 - length(uv - 0.5) * 0.72;
    float base = 0.11 + 0.05 * vignette;

    // Volumetric noise field - slow moving texture
    float n = fbm(pos * 3.0 + uTime * 0.08);
    float n2 = fbm(pos * 5.0 - uTime * 0.05 + 10.0);
    float surface = n * 0.14 + n2 * 0.07;

    // Spotlight - soft radial falloff from mouse
    float dist = length(pos - mouse);
    float spotlight = exp(-dist * dist * 8.0) * 0.35;

    // Secondary ambient glow - subtle breathing
    float breath = sin(uTime * 0.3) * 0.5 + 0.5;
    vec2 glowCenter = vec2(0.5 * aspect.x, 0.5) + vec2(
      sin(uTime * 0.15) * 0.3,
      cos(uTime * 0.12) * 0.2
    );
    float ambientGlow = exp(-length(pos - glowCenter) * 1.2) * 0.10 * (0.7 + 0.3 * breath);

    // Edge highlight - metallic rim lighting from cursor
    float rimDist = length(pos - mouse);
    float rim = smoothstep(0.6, 0.2, rimDist) * smoothstep(0.05, 0.15, rimDist) * 0.15;

    // Combine
    float lum = base + surface + ambientGlow;

    // Subtle silver tint
    vec3 color = vec3(lum);
    color *= vignette;

    // Film grain (very subtle)
    float grain = (hash(uv * uTime * 100.0) - 0.5) * 0.012;
    color += grain;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

const VolumetricBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(true);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return false;

    glRef.current = gl;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    return true;
  }, []);

  useEffect(() => {
    if (!initGL()) return;

    const canvas = canvasRef.current!;
    const gl = glRef.current!;
    const program = programRef.current!;

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uTime = gl.getUniformLocation(program, "uTime");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5); // Cap DPR for perf
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove);

    // Visibility API - pause when tab hidden
    const onVisibility = () => {
      activeRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const startTime = performance.now();

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (!activeRef.current) return;

      // Smooth mouse lerp
      const m = mouseRef.current;
      const t = targetMouseRef.current;
      m.x += (t.x - m.x) * 0.05;
      m.y += (t.y - m.y) * 0.05;

      const time = (performance.now() - startTime) * 0.001;

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, m.x, m.y);
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [initGL]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default VolumetricBackground;
