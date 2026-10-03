import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FRAG_FILM, VERT } from "../shader";

/* The app's ramp, lightest → darkest, exactly as CanvasShader.tsx builds it:
   the two borrowed stops at ×1.026, the three canvas tokens as they are. */
const BORROWED = 1.026;
const hex = (h: string, k = 1) =>
  [1, 3, 5].map((i) => Math.min(1, (parseInt(h.slice(i, i + 2), 16) / 255) * k));
const RAMP = [
  ...hex("#ecf8f9", BORROWED),
  ...hex("#dbeded", BORROWED),
  ...hex("#e2edf1"),
  ...hex("#d3e4e7"),
  ...hex("#b1cad2"),
];

type GLState = {
  gl: WebGLRenderingContext;
  uTime: WebGLUniformLocation | null;
  uLift: WebGLUniformLocation | null;
};

function setup(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh) ?? "shader failed");
    }
    return sh;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_FILM));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(gl.getUniformLocation(prog, "u_res"), canvas.width, canvas.height);
  gl.uniform3fv(gl.getUniformLocation(prog, "u_ramp[0]"), new Float32Array(RAMP));
  /* no pointer in a video */
  gl.uniform2f(gl.getUniformLocation(prog, "u_pointer"), 0, 0);
  gl.uniform2f(gl.getUniformLocation(prog, "u_drag"), 0, 0);
  gl.uniform1f(gl.getUniformLocation(prog, "u_pull"), 0);
  return {
    gl,
    uTime: gl.getUniformLocation(prog, "u_time"),
    uLift: gl.getUniformLocation(prog, "u_lift"),
  };
}

/**
 * The living canvas — the app's own WebGL background, driven by the frame
 * instead of the clock so every render is identical.
 *
 * `speed` scales shader seconds per video second: the app drifts for a
 * minutes-long visit; a 50s film wants the same forms to visibly breathe.
 * `lift` (0..1) is the app's logo-entrance brighten.
 */
export const LivingCanvas: React.FC<{
  speed?: number;
  start?: number;
  lift?: number;
}> = ({ speed = 2.2, start = 11, lift = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef<GLState | null>(null);

  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!state.current) state.current = setup(canvas);
    const st = state.current;
    if (!st) return;
    st.gl.uniform1f(st.uTime, start + (frame / fps) * speed);
    if (st.uLift) st.gl.uniform1f(st.uLift, lift);
    st.gl.drawArrays(st.gl.TRIANGLES, 0, 3);
  }, [frame, fps, speed, start, lift]);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(165deg, #E2EDF1, #D3E4E7 50%, #B1CAD2)` }}>
      <canvas ref={ref} width={width} height={height} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
