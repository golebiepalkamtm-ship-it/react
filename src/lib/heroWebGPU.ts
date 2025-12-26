 
const CONFIG: any = {
  particleCount: 400000,
  perMouse: 300,
  color: [0.8, 0.65, 0.4],
  size: 2,
  minSize: 0.001,
  spread: 8,
  explosionForce: 10,
  movementSpread: 20,
  speed: 0.001,
  fadeSpeed: 0.06,
  far: 100,
  maxZ: 100,
};

// Shaders (kept as provided)
const SHADER_PARTICLES = `
struct Uniforms {
    resolution: vec2<f32>,
    pixelRatio: f32,
    time: f32,
    speed: f32,
    size: f32,
    minSize: f32,
    spread: f32,
    movementSpread: f32,
    explosionForce: f32,
    far: f32,
    fadeSpeed: f32,
    maxZ: f32
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) vProgress: f32,
    @location(1) vRandom: f32,
    @location(2) vDiff: f32,
    @location(3) vUv: vec2<f32>,
    @location(4) vDepth: f32
};

fn easeOutQuart(x: f32) -> f32 {
    return 1.0 - pow(1.0 - x, 4.0);
}

@vertex
fn vs_main(@location(0) pos: vec2<f32>, @location(1) progress: f32, @location(2) random: f32, @location(3) diff: f32, @location(4) uv: vec2<f32>, @location(5) depth: f32) -> VertexOutput {
    var out: VertexOutput;
    let size = max(u.size * u.pixelRatio * (1.0 - progress * 0.8), u.minSize * u.pixelRatio);
    let pos = pos + (random - 0.5) * u.spread * u.pixelRatio * (1.0 - progress * 0.5);
    let clipX = (pos.x / (u.resolution.x * 0.5)) - 1.0;
    let clipY = (pos.y / (u.resolution.y * 0.5)) - 1.0;
    out.position = vec4<f32>(clipX, clipY, 0.0, 1.0);
    out.vProgress = progress;
    out.vRandom = random;
    out.vDiff = diff;
    out.vUv = uv;
    out.vDepth = depth;
    return out;
}

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let alpha = 1.0 - in.vProgress;
    let color = vec3<f32>(u.color[0], u.color[1], u.color[2]);
    return vec4<f32>(color, alpha * alpha);
}
`;

class WebGPUApp {
  canvas: HTMLCanvasElement;
  dpr: number;
  mouseIndex: number;
  oldPos: any;
  lastFx: number;
  lastFy: number;
  animState: string;
  animStartTime: number;
  adapter: any;
  device: any;
  context: any;
  format: any;
  bufStatic: any;
  bufDynamic: any;
  bufUniforms: any;
  pipelineParticles: any;
  bindGroupParticles: any;
  width: number;
  height: number;
  halfW: number;
  halfH: number;
  mousePos: any;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.dpr = Math.min(window.devicePixelRatio, 2) || 1;
    this.mouseIndex = 0;
    this.oldPos = null;
    this.lastFx = 0;
    this.lastFy = 0;
    this.animState = 'spiral';
    this.animStartTime = 0;
    this.resize();
  }

  async init() {
    if (!('gpu' in navigator)) {
      console.warn('WebGPU not supported');
      return;
    }
    try {
      // @ts-expect-error - webgpu types may not be available in all TS configs
      this.adapter = await (navigator as any).gpu.requestAdapter();
      // @ts-expect-error - adapter.requestDevice may be missing from lib types
      this.device = await this.adapter.requestDevice();
      this.context = this.canvas.getContext('webgpu');
      this.format = (navigator as any).gpu.getPreferredCanvasFormat();

      this.context.configure({ device: this.device, format: this.format, alphaMode: 'premultiplied' });

      await this.setupParticles();
      this.setupInputs();

      window.addEventListener('resize', () => this.resize());

      this.animStartTime = performance.now();
      requestAnimationFrame((t) => this.render(t));
    } catch (e: any) {
      console.error('WebGPU init failed:', e);
      // Log error code if available
      if (e instanceof GPUValidationError || e instanceof GPUOutOfMemoryError) {
        console.error('Error code:', e.message);
      }
    }
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio, 2) || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.halfW = this.width / 2;
    this.halfH = this.height / 2;
    if (this.context && this.device) {
      this.context.configure({ device: this.device, format: this.format, alphaMode: 'premultiplied' });
    }
  }

  async setupParticles() {
    const count = CONFIG.particleCount;
    const staticData = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) staticData[i] = Math.random();
    this.bufStatic = this.createBuffer(staticData, GPUBufferUsage.VERTEX);

    const dynamicData = new Float32Array(count * 6);
    for (let i = 0; i < count * 6; i += 6) {
      dynamicData[i] = -9999;
      dynamicData[i + 1] = -9999;
      dynamicData[i + 2] = 0;
      dynamicData[i + 3] = 0;
      dynamicData[i + 4] = 0;
      dynamicData[i + 5] = 0;
    }
    this.bufDynamic = this.createBuffer(dynamicData, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);

    this.bufUniforms = this.device.createBuffer({ size: 128, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

    const module = this.device.createShaderModule({ code: SHADER_PARTICLES });
    this.pipelineParticles = this.device.createRenderPipeline({ layout: 'auto', vertex: { module, entryPoint: 'vs_main', buffers: [{ arrayStride: 16, stepMode: 'vertex', attributes: [{ format: 'float32x2', offset: 0, shaderLocation: 0 }, { format: 'float32', offset: 8, shaderLocation: 1 }, { format: 'float32', offset: 12, shaderLocation: 2 }, { format: 'float32', offset: 16, shaderLocation: 3 }, { format: 'float32x2', offset: 20, shaderLocation: 4 }, { format: 'float32', offset: 28, shaderLocation: 5 }] }, { arrayStride: 24, stepMode: 'instance', attributes: [{ format: 'float32x2', offset: 0, shaderLocation: 6 }, { format: 'float32', offset: 8, shaderLocation: 7 }, { format: 'float32', offset: 12, shaderLocation: 8 }, { format: 'float32x2', offset: 16, shaderLocation: 9 }, { format: 'float32', offset: 24, shaderLocation: 10 }] }] }, fragment: { module, entryPoint: 'fs_main', targets: [{ format: this.format, blend: { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } } }] }, primitive: { topology: 'triangle-strip' } });

    const sampler = this.device.createSampler({ minFilter: 'linear', magFilter: 'linear' });
    this.bindGroupParticles = this.device.createBindGroup({ layout: this.pipelineParticles.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: this.bufUniforms } }] });
  }

  createBuffer(data: Float32Array, usage: number) {
    const buffer = this.device.createBuffer({ size: data.byteLength, usage, mappedAtCreation: true });
    new Float32Array(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
  }

  setupInputs() {
    const handler = (cx: number, cy: number) => { this.updateTrail(cx * this.dpr, cy * this.dpr); };
    window.addEventListener('pointermove', (e) => handler(e.clientX, e.clientY));
  }

  updateTrail(x: number, y: number) {
    if (this.animState !== 'interactive') return;
    const count = Math.min(CONFIG.perMouse, CONFIG.particleCount);
    const data = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const ratio = i / count;
      let cx = this.oldPos ? this.oldPos.x + (x - this.oldPos.x) * ratio : x;
      let cy = this.oldPos ? this.oldPos.y + (y - this.oldPos.y) * ratio : y;
      if (jitterAmount > 0) { cx += (Math.random() - 0.5) * jitterAmount; cy += (Math.random() - 0.5) * jitterAmount; }
      const iFx = this.lastFx + (targetFx - this.lastFx) * ratio;
      const iFy = this.lastFy + (targetFy - this.lastFy) * ratio;
      const idx = i * 6;
      data[idx] = cx;
      data[idx + 1] = cy;
      data[idx + 2] = now;
      data[idx + 3] = dist;
      data[idx + 4] = iFx;
      data[idx + 5] = iFy;
    }
    this.lastFx = targetFx;
    this.lastFy = targetFy;
    const startIdx = this.mouseIndex % CONFIG.particleCount;
    const byteOffset = startIdx * 6 * 4;
    this.device.queue.writeBuffer(this.bufDynamic, byteOffset, data);
    this.mouseIndex = (this.mouseIndex + count) % CONFIG.particleCount;
    this.oldPos = { x, y };
  }

  render(time: number) {
    const elapsed = time - this.animStartTime;
    if (this.animState === 'spiral') {
      const dur = 1080; if (elapsed > dur) { this.animState = 'interactive'; this.animStartTime = time; this.oldPos = null; this.updateTrail(-1000, 0); } else { const p = Math.pow(elapsed / dur - 1, 3) + 1; const period = Math.PI * 3; const amp = Math.min(this.width * 0.1, 200 * this.dpr); const cx = Math.cos(p * period) * amp + this.halfW; const cy = Math.sin(p * period) * amp * 0.5 + this.height * 0.5 - p * 200 * this.dpr; this.updateTrail(cx, cy); }
    }

    const encoder = this.device.createCommandEncoder(); const pass = encoder.beginRenderPass({ colorAttachments: [{ view: this.context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'store' }] });

    const pUni = new Float32Array([ this.width, this.height, this.dpr, time, CONFIG.speed, CONFIG.size, CONFIG.minSize, CONFIG.spread, CONFIG.movementSpread, CONFIG.explosionForce, CONFIG.far, CONFIG.fadeSpeed, CONFIG.maxZ ]);
    this.device.queue.writeBuffer(this.bufUniforms, 0, pUni);

    pass.setPipeline(this.pipelineParticles); pass.setBindGroup(0, this.bindGroupParticles); pass.setVertexBuffer(0, this.bufStatic); pass.setVertexBuffer(1, this.bufDynamic); pass.draw(6, CONFIG.particleCount, 0, 0);

    pass.end(); this.device.queue.submit([encoder.finish()]); requestAnimationFrame((t) => this.render(t));
  }
}

export async function initHeroWebGPU(canvas?: HTMLCanvasElement | null) {
  try {
    let usedCanvas = canvas || null;
    if (!usedCanvas) {
      // create global full-screen canvas appended to body
      usedCanvas = document.getElementById('global-particles-canvas') as HTMLCanvasElement | null;
      if (!usedCanvas) {
        usedCanvas = document.createElement('canvas');
        usedCanvas.id = 'global-particles-canvas';
        usedCanvas.style.position = 'fixed';
        usedCanvas.style.inset = '0';
        usedCanvas.style.width = '100%';
        usedCanvas.style.height = '100%';
        // place canvas under UI elements like hero title (which uses z-10)
        // place canvas below header but above video
        usedCanvas.style.zIndex = '15';
        usedCanvas.style.pointerEvents = 'none';
        document.body.appendChild(usedCanvas);
      }
    }

    const app = new WebGPUApp(usedCanvas as HTMLCanvasElement);
    await app.init();
    return app;
  } catch (e: any) {
    console.error(e);
    // no loader in global mode
    return null;
  }
}