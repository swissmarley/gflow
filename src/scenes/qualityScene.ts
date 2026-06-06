import * as THREE from "three";
import type { SceneRuntime } from "./types";

const lerp = THREE.MathUtils.lerp;
const smoother = THREE.MathUtils.smootherstep;

const GATES = 5;
const GATE_Z_NEAR = -1;
const GATE_Z_FAR = -37;

/**
 * "Pass through every gate." — five luminous particle rings stand in sequence;
 * the camera flies straight through them as the section scrolls and each gate
 * flares amber as it becomes active (in step with the gate cards). Ambient dust
 * streams toward the camera. Shares the products/skills glow language.
 */
export function createQualityScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.028);

  const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 120);

  const pixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
    1.75
  );
  // one distinct color per gate: Brief, Generate, Review, Refine, Ship
  const GATE_COLORS = new Float32Array([
    0.541, 1.0, 0.776, // mint
    0.31, 0.84, 1.0, // cyan
    1.0, 0.706, 0.325, // amber
    0.714, 0.573, 1.0, // violet
    1.0, 0.561, 0.639 // rose
  ]);
  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uActive: { value: 0 },
    uColors: { value: GATE_COLORS }
  };
  const disposables: { dispose: () => void }[] = [];

  // ---- Five gate rings (one draw, aGate selects depth + glow) -------------
  const PER = 360;
  const COUNT = GATES * PER;
  const pos = new Float32Array(COUNT * 3);
  const aGate = new Float32Array(COUNT);
  const aAngle = new Float32Array(COUNT);
  const aRadius = new Float32Array(COUNT);
  const aSeed = new Float32Array(COUNT);
  for (let g = 0; g < GATES; g += 1) {
    for (let j = 0; j < PER; j += 1) {
      const i = g * PER + j;
      aGate[i] = g;
      aAngle[i] = (j / PER) * Math.PI * 2 + Math.random() * 0.04;
      aRadius[i] = 2.4 + (Math.random() - 0.5) * 0.28;
      aSeed[i] = Math.random();
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aGate", new THREE.BufferAttribute(aGate, 1));
  geo.setAttribute("aAngle", new THREE.BufferAttribute(aAngle, 1));
  geo.setAttribute("aRadius", new THREE.BufferAttribute(aRadius, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uActive;
      uniform vec3 uColors[${GATES}];
      attribute float aGate;
      attribute float aAngle;
      attribute float aRadius;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float gz = mix(${GATE_Z_NEAR.toFixed(1)}, ${GATE_Z_FAR.toFixed(1)}, aGate / ${(GATES - 1).toFixed(1)});
        float breathe = 1.0 + 0.03 * sin(uTime * 0.8 + aGate * 1.7);
        float r = aRadius * breathe;
        vec3 p = vec3(cos(aAngle) * r, sin(aAngle) * r, gz);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        float closeness = 1.0 - clamp(abs(aGate - uActive), 0.0, 1.0);
        closeness = pow(closeness, 2.2);

        // each gate keeps its own color; the active gate just burns brighter
        vColor = uColors[int(aGate + 0.5)];

        float ps = mix(5.0, 12.0, aSeed) * (1.0 + closeness * 2.0);
        gl_PointSize = ps * uPixelRatio * (11.0 / max(0.1, -mv.z));

        float twinkle = 0.7 + 0.3 * sin(uTime * 2.0 + aSeed * 50.0);
        vAlpha = (0.34 + closeness * 0.66) * twinkle;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float dist = length(d);
        if (dist > 0.5) discard;
        float glow = pow(smoothstep(0.5, 0.0, dist), 1.7);
        gl_FragColor = vec4(vColor, glow * vAlpha);
      }
    `
  });
  const ringPoints = new THREE.Points(geo, mat);
  ringPoints.frustumCulled = false;
  scene.add(ringPoints);
  disposables.push(geo, mat);

  // ---- Ambient dust streaming toward the camera ---------------------------
  const DUST = 1400;
  const dPos = new Float32Array(DUST * 3);
  const dSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i += 1) {
    dPos[i * 3] = (Math.random() - 0.5) * 26;
    dPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    dPos[i * 3 + 2] = Math.random() * 44;
    dSeed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dSeed, 1));
  const dustMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.z = mod(position.z + uTime * 0.8, 44.0) - 40.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.3 + aSeed * 2.4) * uPixelRatio * (10.0 / max(0.1, -mv.z));
        vAlpha = (0.1 + 0.14 * aSeed) * smoothstep(0.0, 5.0, -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float dist = length(d);
        if (dist > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(0.62, 0.86, 0.78, glow * vAlpha);
      }
    `
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);
  disposables.push(dustGeo, dustMat);

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      uniforms.uTime.value = reducedMotion ? 4.0 : elapsed;
      // flare the exact gate that matches the active gate card
      uniforms.uActive.value = Math.min(GATES - 1, Math.floor(progress * GATES));

      const p = smoother(progress, 0, 1);
      camera.position.z = lerp(6, GATE_Z_FAR + 5, p);
      camera.position.x = reducedMotion ? 0 : Math.sin(elapsed * 0.18) * 0.18;
      camera.position.y = reducedMotion ? 0 : Math.cos(elapsed * 0.15) * 0.12;
      camera.lookAt(0, 0, camera.position.z - 10);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    }
  };
}
