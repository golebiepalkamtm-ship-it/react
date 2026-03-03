import { useEffect, useRef } from "react";

/**
 * NeonCursor — Pure WebGL neon trail effect
 * No external dependencies. Renders a glowing bezier-curve trail
 * that follows the mouse cursor with spring physics.
 */

const VERT = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Fragment shader: renders neon glow along a bezier spline
const FRAG = `
  precision mediump float;

  uniform vec2 uResolution;
  uniform vec2 uPoints[16];
  uniform vec2 uRatio;
  uniform vec2 uSize;
  uniform vec3 uColor;

  // Signed distance to quadratic bezier (shadertoy.com/view/MlKcDD)
  float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    float kk = 1.0 / dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);
    float res = 0.0;
    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
    float h = q*q + 4.0*p3;
    if(h >= 0.0){
      h = sqrt(h);
      vec2 x = (vec2(h, -h) - q) / 2.0;
      vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
      float t = uv.x + uv.y - kx;
      t = clamp(t, 0.0, 1.0);
      vec2 qos = d + (c + b*t)*t;
      res = length(qos);
    } else {
      float z = sqrt(-p);
      float v = acos(q/(p*z*2.0)) / 3.0;
      float m = cos(v);
      float n = sin(v)*1.732050808;
      vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
      t = clamp(t, 0.0, 1.0);
      vec2 qos = d + (c + b*t.x)*t.x;
      float dis = dot(qos,qos);
      res = dis;
      qos = d + (c + b*t.y)*t.y;
      dis = dot(qos,qos);
      res = min(res,dis);
      qos = d + (c + b*t.z)*t.z;
      dis = dot(qos,qos);
      res = min(res,dis);
      res = sqrt(res);
    }
    return res;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 pos = (uv - 0.5) * uRatio;

    vec2 c_val = (uPoints[0] + uPoints[1]) / 2.0;
    vec2 c_prev;
    float dist = 10000.0;
    for(int i = 0; i < 15; i++){
      c_prev = c_val;
      c_val = (uPoints[i] + uPoints[i + 1]) / 2.0;
      dist = min(dist, sdBezier(pos, c_prev, uPoints[i], c_val));
    }
    dist = max(0.0, dist);

    float glow = pow(uSize.y / dist, 1.0);
    vec3 col = vec3(0.0);
    col += 10.0 * vec3(smoothstep(uSize.x, 0.0, dist));
    col += glow * uColor;

    // Tone mapping
    col = 1.0 - exp(-col);
    col = pow(col, vec3(0.4545));

    gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
`;

const CURVE_POINTS = 80;
const SHADER_POINTS = 16;

export const NeonCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const activeRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    // --- Compile shaders ---
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("Neon fragment shader error:", gl.getShaderInfoLog(fs));
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Enable alpha blending so transparent areas show page content
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uRatio = gl.getUniformLocation(program, "uRatio");
    const uSize = gl.getUniformLocation(program, "uSize");
    const uColor = gl.getUniformLocation(program, "uColor");
    const uPointsLocs: (WebGLUniformLocation | null)[] = [];
    for (let i = 0; i < SHADER_POINTS; i++) {
      uPointsLocs.push(gl.getUniformLocation(program, `uPoints[${i}]`));
    }

    // --- Spline state ---
    const curvePoints: { x: number; y: number }[] = [];
    for (let i = 0; i < CURVE_POINTS; i++) curvePoints.push({ x: 0, y: 0 });

    const shaderPts: { x: number; y: number }[] = [];
    for (let i = 0; i < SHADER_POINTS; i++) shaderPts.push({ x: 0, y: 0 });

    let hover = false;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let ratioX = 1;
    let ratioY = 1;
    let sizeX = 5;
    let sizeY = 30;
    let velX = 0;
    let velY = 0;
    let velZ = 0;
    let velTX = 0;
    let velTY = 0;
    let velTZ = 0;
    let colorR = 1;
    let colorG = 0;
    let colorB = 1;
    let time = 0;

    const RADIUS1 = 5;
    const RADIUS2 = 30;
    const CURVE_LERP = 0.5;
    const VEL_THRESHOLD = 10;
    const SLEEP_RX = 100;
    const SLEEP_RY = 100;
    const SLEEP_TX = 0.0025;
    const SLEEP_TY = 0.0025;

    // --- Sizing ---
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);

      sizeX = RADIUS1;
      sizeY = RADIUS2;
      if (width >= height) {
        ratioX = 1;
        ratioY = height / width;
        sizeX /= width;
        sizeY /= width;
      } else {
        ratioX = width / height;
        ratioY = 1;
        sizeX /= height;
        sizeY /= height;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Pointer tracking ---
    const onPointerMove = (e: PointerEvent) => {
      hover = true;
      const nx = (e.clientX / width) * 2 - 1;
      const ny = -((e.clientY / height) * 2 - 1);
      curvePoints[0]!.x = 0.5 * nx * ratioX;
      curvePoints[0]!.y = 0.5 * ny * ratioY;

      const dx = Math.abs(e.movementX || 0);
      const dy = Math.abs(e.movementY || 0);
      velTX = Math.min(velX + dx / VEL_THRESHOLD, 1);
      velTY = Math.min(velY + dy / VEL_THRESHOLD, 1);
      velTZ = Math.sqrt(velTX * velTX + velTY * velTY);
    };

    const onPointerLeave = () => {
      hover = false;
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerleave", onPointerLeave);

    const onVisibility = () => {
      activeRef.current = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    // --- Catmull-Rom spline interpolation ---
    function getSplinePoint(
      pts: { x: number; y: number }[],
      t: number,
      out: { x: number; y: number },
    ) {
      const n = pts.length - 1;
      const p = t * n;
      const i = Math.floor(p);
      const f = p - i;

      const p0 = pts[Math.max(0, i - 1)]!;
      const p1 = pts[i]!;
      const p2 = pts[Math.min(n, i + 1)]!;
      const p3 = pts[Math.min(n, i + 2)]!;

      const t2 = f * f;
      const t3 = t2 * f;

      out.x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * f +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      out.y =
        0.5 *
        (2 * p1.y +
          (-p0.y + p2.y) * f +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);
    }

    // --- Render loop ---
    const startTime = performance.now();

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      if (!activeRef.current) return;

      time = performance.now() - startTime;

      // Lerp curve points toward head
      for (let i = 1; i < CURVE_POINTS; i++) {
        curvePoints[i]!.x +=
          (curvePoints[i - 1]!.x - curvePoints[i]!.x) * CURVE_LERP;
        curvePoints[i]!.y +=
          (curvePoints[i - 1]!.y - curvePoints[i]!.y) * CURVE_LERP;
      }

      // Sample spline into shader points
      for (let i = 0; i < SHADER_POINTS; i++) {
        getSplinePoint(curvePoints, i / (SHADER_POINTS - 1), shaderPts[i]!);
      }

      // Color logic
      if (!hover) {
        // Sleep animation — gentle floating
        const t1 = time * SLEEP_TX;
        const t2 = time * SLEEP_TY;
        const wWidth = width >= height ? 1 : width / height;
        const r1 = (SLEEP_RX * wWidth) / width;
        const r2 = (SLEEP_RY * wWidth) / width;
        curvePoints[0]!.x = r1 * Math.cos(t1);
        curvePoints[0]!.y = r2 * Math.sin(t2);
        colorR = 0.5 + 0.5 * Math.cos(time * 0.0015);
        colorG = 0;
        colorB = 1 - colorR;
      } else {
        colorR = velZ;
        colorG = 0;
        colorB = 1 - velZ;
        velX *= 0.95;
        velY *= 0.95;
        velZ *= 0.95;
        velX += (velTX - velX) * 0.05;
        velY += (velTY - velY) * 0.05;
        velZ += (velTZ - velZ) * 0.05;
      }

      // --- Draw ---
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uRatio, ratioX, ratioY);
      gl.uniform2f(uSize, sizeX, sizeY);
      gl.uniform3f(uColor, colorR, colorG, colorB);

      for (let i = 0; i < SHADER_POINTS; i++) {
        gl.uniform2f(uPointsLocs[i]!, shaderPts[i]!.x, shaderPts[i]!.y);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    render();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    />
  );
};
