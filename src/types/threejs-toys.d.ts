declare module "threejs-toys/src/cursors/neon/index" {
  interface NeonCursorConfig {
    el: HTMLElement;
    shaderPoints?: number;
    curvePoints?: number;
    curveLerp?: number;
    radius1?: number;
    radius2?: number;
    velocityTreshold?: number;
    sleepRadiusX?: number;
    sleepRadiusY?: number;
    sleepTimeCoefX?: number;
    sleepTimeCoefY?: number;
  }
  export default function neonCursor(config: NeonCursorConfig): {
    config: NeonCursorConfig;
  };
}
