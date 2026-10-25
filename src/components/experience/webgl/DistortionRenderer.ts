/**
 * DistortionRenderer – zdjęcia z DOM-u rysowane w WebGL.
 *
 * Każdy element zarejestrowany przez `add()` dostaje własną płaszczyznę,
 * która co klatkę przyjmuje pozycję i rozmiar elementu (getBoundingClientRect
 * względem płótna). Layout zostaje w DOM-ie, WebGL tylko „przemalowuje” obraz:
 *
 * - prędkość scrolla wygina płaszczyznę i rozszczepia kanały RGB (aberracja),
 * - kursor wybrzusza zdjęcie, puszcza falę i przechyla płaszczyznę w 3D,
 * - paralaksa przesuwa kadr wewnątrz ramki.
 *
 * Czysty WebGL 1 bez bibliotek: jedna siatka 24×24 i jeden program
 * współdzielone przez wszystkie zdjęcia.
 */

const SEGMENTS = 24;
const PERSPECTIVE = 1400; // px – odległość „kamery” dla przechyłu 3D
const MAX_DPR = 2;

const VERTEX_SHADER = `
attribute vec2 aUv;

uniform vec2 uViewport;   // rozmiar płótna w px CSS
uniform vec4 uRect;       // x, y, szerokość, wysokość elementu w px CSS
uniform float uVelocity;  // -1..1
uniform float uHover;     // 0..1
uniform vec2 uMouse;      // pozycja kursora w uv zdjęcia
uniform vec2 uTilt;       // przechył w radianach (x, y)
uniform float uOverscan;  // powiększenie płaszczyzny ponad ramkę elementu
uniform float uBulge;     // maksymalne wybrzuszenie pod kursorem w px

varying vec2 vUv;

const float PI = 3.14159265;

void main() {
  vUv = aUv;

  vec3 p = vec3((aUv - 0.5) * uRect.zw * uOverscan, 0.0);

  // Wygięcie jak flaga ciągnięta przez scroll: środek zostaje w tyle.
  p.x += sin(aUv.y * PI) * uVelocity * uRect.z * 0.06;

  // Wybrzuszenie pod kursorem – zdjęcie „oddycha” w stronę widza.
  float d = distance(aUv, uMouse);
  p.z += uHover * uBulge * (1.0 - smoothstep(0.0, 0.7, d));

  // Przechył 3D wokół środka zdjęcia.
  float cx = cos(uTilt.x), sx = sin(uTilt.x);
  p = vec3(p.x, p.y * cx - p.z * sx, p.y * sx + p.z * cx);
  float cy = cos(uTilt.y), sy = sin(uTilt.y);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);

  float scale = ${PERSPECTIVE.toFixed(1)} / (${PERSPECTIVE.toFixed(1)} - p.z);
  vec2 screen = p.xy * scale + uRect.xy + uRect.zw * 0.5;

  vec2 clip = screen / uViewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
// Wspólne uniformy muszą mieć tę samą precyzję co w vertex shaderze (highp).
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D uTexture;
uniform vec2 uImage;      // naturalny rozmiar zdjęcia
uniform sampler2D uPrevTexture; // poprzednie zdjęcie przy podmianie
uniform vec2 uPrevImage;
uniform float uMix;       // 0 = poprzednie zdjęcie, 1 = bieżące
uniform vec4 uRect;
uniform float uVelocity;
uniform float uHover;
uniform vec2 uMouse;
uniform float uTime;
uniform float uParallax;  // -1..1, pozycja karty względem środka ekranu
uniform float uRadius;    // promień rogów w px CSS
uniform float uOverscan;
uniform float uZoom;      // przybliżenie kadru (zapas na paralaksę), 1 = jak w CSS

varying vec2 vUv;

// Odległość od krawędzi zaokrąglonego prostokąta (ujemna w środku).
float roundedBox(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// object-fit: cover
vec2 cover(vec2 uv, vec2 plane, vec2 image) {
  float planeRatio = plane.x / plane.y;
  float imageRatio = image.x / image.y;
  vec2 s = planeRatio > imageRatio
    ? vec2(1.0, imageRatio / planeRatio)
    : vec2(planeRatio / imageRatio, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// Próbka z rozszczepieniem kanałów RGB (aberracja chromatyczna).
vec3 sampleSplit(sampler2D tex, vec2 uv, vec2 image, vec2 shift) {
  vec2 c = cover(uv, uRect.zw, image);
  return vec3(
    texture2D(tex, c + shift).r,
    texture2D(tex, c).g,
    texture2D(tex, c - shift).b
  );
}

void main() {
  float speed = abs(uVelocity);

  // Płaszczyzna jest większa od ramki o uOverscan: rozciągamy uv tak samo,
  // więc w ramce kadr jest identyczny jak <img> z object-fit: cover,
  // a zapas pokazuje dalszą część zdjęcia zamiast je przybliżać.
  // uZoom > 1 przybliża kadr, żeby paralaksa nie odsłaniała krawędzi.
  vec2 uv = (vUv - 0.5) * uOverscan / uZoom + 0.5;
  uv.x += uParallax * 0.035;

  // Fala przy szybkim scrollu.
  uv.y += sin(uv.x * 10.0 + uTime * 2.0) * 0.012 * speed;

  // Fala rozchodząca się od kursora.
  vec2 toMouse = vUv - uMouse;
  float d = length(toMouse);
  float ripple = sin(d * 30.0 - uTime * 5.0) * 0.006 * uHover * (1.0 - smoothstep(0.0, 0.55, d));
  uv += (d > 0.0001 ? toMouse / d : vec2(0.0)) * ripple;

  // Aberracja chromatyczna rośnie z prędkością i przy najechaniu.
  vec2 shift = vec2(0.014 * uVelocity + 0.004 * uHover, 0.0);
  vec3 current = sampleSplit(uTexture, uv, uImage, shift);
  vec3 color = uMix < 1.0
    ? mix(sampleSplit(uPrevTexture, uv, uPrevImage, shift), current, uMix)
    : current;

  // Rogi jak w CSS (border-radius), z miękką krawędzią 1px.
  vec2 planeSize = uRect.zw * uOverscan;
  float edge = roundedBox((vUv - 0.5) * planeSize, planeSize * 0.5, uRadius);
  float alpha = 1.0 - smoothstep(-1.0, 0.0, edge);

  // Wyjście z wstępnie przemnożoną alfą (premultipliedAlpha: true).
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

export interface DistortionOptions {
  /** Powiększenie płaszczyzny ponad ramkę (1 = dokładnie ramka). Przy
   *  przycinającym kontenerze zapas chowa krawędzie przy przechyle. */
  overscan?: number;
  /** Promień rogów w px; domyślnie border-radius elementu. */
  radius?: number;
  /** Mnożnik przechyłu 3D pod kursorem (1 = domyślny). */
  tilt?: number;
  /** Wybrzuszenie pod kursorem w px. */
  bulge?: number;
  /** Przybliżenie kadru na zapas dla paralaksy (1 = kadr jak w CSS). */
  zoom?: number;
}

const TEXTURE_FADE_FRAMES = 36; // ~0,6 s przy 60 FPS, jak przenikanie karuzeli

interface Plane {
  el: HTMLElement;
  texture: WebGLTexture | null;
  imageSize: [number, number];
  prevTexture: WebGLTexture | null;
  prevImageSize: [number, number];
  mix: number;
  src: string;
  ready: boolean;
  hover: number;
  hoverTarget: number;
  mouse: [number, number];
  mouseTarget: [number, number];
  tilt: [number, number];
  parallax: number;
  radius: number;
}

type UniformName =
  | "uViewport"
  | "uRect"
  | "uVelocity"
  | "uHover"
  | "uMouse"
  | "uTilt"
  | "uTexture"
  | "uImage"
  | "uTime"
  | "uParallax"
  | "uRadius"
  | "uOverscan"
  | "uZoom"
  | "uBulge"
  | "uPrevTexture"
  | "uPrevImage"
  | "uMix";

const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Nie udało się utworzyć shadera");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Błąd kompilacji shadera: ${log}`);
  }
  return shader;
};

/** Siatka trójkątów (SEGMENTS × SEGMENTS) – tylko współrzędne uv. */
const buildGrid = () => {
  const uvs: number[] = [];
  for (let y = 0; y < SEGMENTS; y++) {
    for (let x = 0; x < SEGMENTS; x++) {
      const u0 = x / SEGMENTS;
      const u1 = (x + 1) / SEGMENTS;
      const v0 = y / SEGMENTS;
      const v1 = (y + 1) / SEGMENTS;
      uvs.push(u0, v0, u1, v0, u0, v1, u0, v1, u1, v0, u1, v1);
    }
  }
  return new Float32Array(uvs);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class DistortionRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;
  private readonly uniforms: Record<UniformName, WebGLUniformLocation | null>;
  private readonly vertexCount: number;
  private readonly planes: Plane[] = [];
  private readonly cleanups: (() => void)[] = [];
  private readonly options: Required<Omit<DistortionOptions, "radius">> & {
    radius: number | undefined;
  };
  private velocity = 0;
  private startTime = performance.now();
  private lost = false;

  /** Rzuca wyjątek, gdy WebGL jest niedostępny – wywołujący wraca wtedy do CSS. */
  constructor(canvas: HTMLCanvasElement, options: DistortionOptions = {}) {
    this.canvas = canvas;
    this.options = {
      overscan: options.overscan ?? 1,
      radius: options.radius,
      tilt: options.tilt ?? 1,
      bulge: options.bulge ?? 60,
      zoom: options.zoom ?? 1.08,
    };
    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL niedostępny");
    this.gl = gl;

    const program = gl.createProgram();
    if (!program) throw new Error("Nie udało się utworzyć programu WebGL");
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Błąd linkowania: ${gl.getProgramInfoLog(program)}`);
    }
    this.program = program;
    gl.useProgram(program);

    const grid = buildGrid();
    this.vertexCount = grid.length / 2;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("Nie udało się utworzyć bufora WebGL");
    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(program, "aUv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    const names: UniformName[] = [
      "uViewport",
      "uRect",
      "uVelocity",
      "uHover",
      "uMouse",
      "uTilt",
      "uTexture",
      "uImage",
      "uTime",
      "uParallax",
      "uRadius",
      "uOverscan",
      "uZoom",
      "uBulge",
      "uPrevTexture",
      "uPrevImage",
      "uMix",
    ];
    this.uniforms = Object.fromEntries(
      names.map((name) => [name, gl.getUniformLocation(program, name)]),
    ) as Record<UniformName, WebGLUniformLocation | null>;

    gl.uniform1i(this.uniforms.uTexture, 0);
    gl.uniform1i(this.uniforms.uPrevTexture, 1);
    gl.uniform1f(this.uniforms.uOverscan, this.options.overscan);
    gl.uniform1f(this.uniforms.uZoom, this.options.zoom);
    gl.uniform1f(this.uniforms.uBulge, this.options.bulge);
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Utrata kontekstu (np. sterownik GPU): oddajemy obrazy DOM-owi.
    const onLost = (e: Event) => {
      e.preventDefault();
      this.lost = true;
      this.planes.forEach((plane) => delete plane.el.dataset.gl);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    this.cleanups.push(() => canvas.removeEventListener("webglcontextlost", onLost));
  }

  /** Rejestruje element; `src` to zdjęcie, które ma się w nim wyświetlać. */
  add(el: HTMLElement, src: string) {
    const plane: Plane = {
      el,
      texture: null,
      imageSize: [1, 1],
      prevTexture: null,
      prevImageSize: [1, 1],
      mix: 1,
      src: "",
      ready: false,
      hover: 0,
      hoverTarget: 0,
      mouse: [0.5, 0.5],
      mouseTarget: [0.5, 0.5],
      tilt: [0, 0],
      parallax: 0,
      // Ten sam promień co w CSS – płaszczyzna wygląda jak ramka z DOM-u.
      radius:
        this.options.radius ?? (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0),
    };
    this.planes.push(plane);
    this.load(plane, src);

    const onEnter = () => {
      plane.hoverTarget = 1;
    };
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      plane.mouseTarget = [
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height,
      ];
    };
    const onLeave = () => {
      plane.hoverTarget = 0;
      plane.mouseTarget = [0.5, 0.5];
    };
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    this.cleanups.push(() => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      delete el.dataset.gl;
    });
  }

  /** Podmienia zdjęcie elementu – nowe przenika nad starym w shaderze. */
  setSource(el: HTMLElement, src: string) {
    const plane = this.planes.find((p) => p.el === el);
    if (plane && plane.src !== src) this.load(plane, src);
  }

  private load(plane: Plane, src: string) {
    plane.src = src;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      // Szybkie przełączanie: liczy się tylko ostatnio zamówione zdjęcie.
      if (this.lost || plane.src !== src) return;
      const gl = this.gl;
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // Zdjęcia nie są potęgami dwójki – WebGL 1 wymaga CLAMP i braku mipmap.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

      if (plane.texture) {
        // Bieżące zdjęcie staje się „poprzednim” i znika pod nowym.
        if (plane.prevTexture) gl.deleteTexture(plane.prevTexture);
        plane.prevTexture = plane.texture;
        plane.prevImageSize = plane.imageSize;
        plane.mix = 0;
      }
      plane.texture = texture;
      plane.imageSize = [image.naturalWidth, image.naturalHeight];
      plane.ready = true;
      // Sygnał dla CSS: od teraz obraz rysuje WebGL, a <img> zostaje
      // przezroczysty (layout, alt i fallback bez zmian).
      plane.el.dataset.gl = "ready";
    };
    image.src = src;
  }

  /**
   * Rysuje klatkę.
   * @param velocity prędkość scrolla w zakresie -1..1
   * @param deltaRatio czas klatki względem 60 FPS (1 = 16,7 ms)
   */
  render(velocity: number, deltaRatio = 1) {
    if (this.lost) return;
    const gl = this.gl;
    const canvas = this.canvas;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Wygładzenia niezależne od liczby klatek.
    const ease = (base: number) => 1 - Math.pow(1 - base, deltaRatio);
    this.velocity = lerp(this.velocity, velocity, ease(0.12));

    const canvasRect = canvas.getBoundingClientRect();
    const time = (performance.now() - this.startTime) / 1000;

    gl.uniform2f(this.uniforms.uViewport, width, height);
    gl.uniform1f(this.uniforms.uVelocity, this.velocity);
    gl.uniform1f(this.uniforms.uTime, time);

    for (const plane of this.planes) {
      if (!plane.ready || !plane.texture) continue;

      const rect = plane.el.getBoundingClientRect();
      const x = rect.left - canvasRect.left;
      const y = rect.top - canvasRect.top;
      // Poza kadrem (z zapasem na wybrzuszenie) – nic nie rysujemy.
      if (x + rect.width < -100 || x > width + 100 || y + rect.height < -100 || y > height + 100) {
        continue;
      }

      plane.hover = lerp(plane.hover, plane.hoverTarget, ease(0.08));
      plane.mouse[0] = lerp(plane.mouse[0], plane.mouseTarget[0], ease(0.12));
      plane.mouse[1] = lerp(plane.mouse[1], plane.mouseTarget[1], ease(0.12));
      const tiltTargetX = (plane.mouse[1] - 0.5) * 0.22 * this.options.tilt * plane.hoverTarget;
      const tiltTargetY = (plane.mouse[0] - 0.5) * 0.3 * this.options.tilt * plane.hoverTarget;
      plane.mix = Math.min(1, plane.mix + deltaRatio / TEXTURE_FADE_FRAMES);
      plane.tilt[0] = lerp(plane.tilt[0], tiltTargetX, ease(0.1));
      plane.tilt[1] = lerp(plane.tilt[1], tiltTargetY, ease(0.1));
      plane.parallax = Math.max(-1, Math.min(1, (x + rect.width / 2 - width / 2) / width));

      gl.uniform4f(this.uniforms.uRect, x, y, rect.width, rect.height);
      gl.uniform2f(this.uniforms.uImage, plane.imageSize[0], plane.imageSize[1]);
      gl.uniform1f(this.uniforms.uHover, plane.hover);
      gl.uniform2f(this.uniforms.uMouse, plane.mouse[0], plane.mouse[1]);
      gl.uniform2f(this.uniforms.uTilt, plane.tilt[0], plane.tilt[1]);
      gl.uniform1f(this.uniforms.uParallax, plane.parallax);
      gl.uniform1f(this.uniforms.uRadius, plane.radius);
      gl.uniform1f(this.uniforms.uMix, plane.mix);
      gl.uniform2f(this.uniforms.uPrevImage, plane.prevImageSize[0], plane.prevImageSize[1]);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plane.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, plane.prevTexture ?? plane.texture);
      gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
  }

  destroy() {
    this.cleanups.forEach((fn) => fn());
    const gl = this.gl;
    this.planes.forEach((plane) => {
      if (plane.texture) gl.deleteTexture(plane.texture);
      if (plane.prevTexture) gl.deleteTexture(plane.prevTexture);
    });
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
    // Bez loseContext(): React może zamontować efekt ponownie na tym samym
    // <canvas> (StrictMode, powrót na stronę), a utracony kontekst nie wraca.
  }
}
