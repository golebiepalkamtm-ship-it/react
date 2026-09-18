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

  // Fast hash
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Value noise with Hermite interpolation
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

  // Fast 2-octave FBM for smooth volumetric fog
  float fbm2(vec2 p) {
    return noise(p) * 0.65 + noise(p * 2.05 + 1.2) * 0.35;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 pos = uv * aspect;
    vec2 mouse = uMouse * aspect;

    // Base vignette (dark charcoal)
    float distCenter = length(uv - 0.5);
    float vignette = 1.0 - distCenter * 0.72;
    float base = 0.10 + 0.05 * vignette;

    // Atmospheric volumetric smoke drift
    float n = fbm2(pos * 2.5 + vec2(uTime * 0.05, -uTime * 0.03));
    float surface = (n - 0.5) * 0.16;

    // Subtle interactive spotlight following mouse
    float dist = length(pos - mouse);
    float spotlight = exp(-dist * dist * 6.0) * 0.12;

    // Ambient breathing glow
    float breath = sin(uTime * 0.4) * 0.5 + 0.5;
    vec2 glowCenter = vec2(0.5 * aspect.x, 0.5) + vec2(
      sin(uTime * 0.15) * 0.25,
      cos(uTime * 0.12) * 0.15
    );
    float ambientGlow = exp(-length(pos - glowCenter) * 1.4) * 0.08 * (0.8 + 0.2 * breath);

    // Combine lighting components
    float lum = base + surface + spotlight + ambientGlow;
    vec3 color = vec3(lum) * vignette;

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
      powerPreference: "high-performance",
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
      // Half-resolution rendering with bilinear filtering provides a smooth,
      // cloud-like volumetric gradient while reducing fill-rate workload by ~75%
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      const w = Math.max(320, Math.floor(window.innerWidth * dpr));
      const h = Math.max(240, Math.floor(window.innerHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMove = (e: MouseEvent) => {
      targetMouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1.0 - e.clientY / window.innerHeight,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    // Pause when tab is inactive to preserve battery and resources
    const onVisibility = () => {
      activeRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const startTime = performance.now();

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (!activeRef.current) return;

      // Smooth mouse interpolation
      const m = mouseRef.current;
      const t = targetMouseRef.current;
      m.x += (t.x - m.x) * 0.08;
      m.y += (t.y - m.y) * 0.08;

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
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, width: "100%", height: "100%" }}
    />
  );
};

export default VolumetricBackground;
