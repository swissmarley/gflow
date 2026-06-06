import * as THREE from "three";
import type { SceneRuntime } from "./types";

const lerp = THREE.MathUtils.lerp;

const COLS = [-6.2, -2.07, 2.07, 6.2];
const ROWS = [2.4, 0, -2.4];
const NODES = 12;

// node grid positions mirror the 4×3 skill card layout (reading order)
const NODE_POS = new Float32Array(NODES * 3);
for (let i = 0; i < NODES; i += 1) {
  NODE_POS[i * 3] = COLS[i % 4];
  NODE_POS[i * 3 + 1] = ROWS[Math.floor(i / 4)];
  NODE_POS[i * 3 + 2] = 0;
}

/**
 * "One current. Every medium." — twelve luminous nodes laid out in the same
 * 4×3 grid as the skill cards, each a softly swirling orb of particles sitting
 * behind its card. The active skill's node flares amber and grows as you
 * scroll, with an ambient current drifting behind. The camera stays put (only
 * micro-parallax) so the orbs stay aligned with the cards.
 */
export function createSkillsScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.022);

  const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 120);
  camera.position.set(0, 0, 11.5);
  camera.lookAt(0, 0, 0);

  const pixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
    1.75
  );
  const uniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uActive: { value: 0 },
    uNodePos: { value: NODE_POS }
  };
  const disposables: { dispose: () => void }[] = [];

  // ---- Node orbs (particles bound to each grid node) -----------------------
  const PER = 150;
  const COUNT = NODES * PER;
  const pos = new Float32Array(COUNT * 3);
  const aNode = new Float32Array(COUNT);
  const aAngle = new Float32Array(COUNT);
  const aRadius = new Float32Array(COUNT);
  const aZ = new Float32Array(COUNT);
  const aSeed = new Float32Array(COUNT);
  for (let n = 0; n < NODES; n += 1) {
    for (let j = 0; j < PER; j += 1) {
      const i = n * PER + j;
      aNode[i] = n;
      aAngle[i] = Math.random() * Math.PI * 2;
      aRadius[i] = Math.pow(Math.random(), 0.7) * 1.05;
      aZ[i] = (Math.random() - 0.5) * 1.2;
      aSeed[i] = Math.random();
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aNode", new THREE.BufferAttribute(aNode, 1));
  geo.setAttribute("aAngle", new THREE.BufferAttribute(aAngle, 1));
  geo.setAttribute("aRadius", new THREE.BufferAttribute(aRadius, 1));
  geo.setAttribute("aZ", new THREE.BufferAttribute(aZ, 1));
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
      uniform vec3 uNodePos[${NODES}];
      attribute float aNode;
      attribute float aAngle;
      attribute float aRadius;
      attribute float aZ;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 base = uNodePos[int(aNode + 0.5)];
        float isActive = step(abs(aNode - uActive), 0.5);

        float swirl = aAngle + uTime * (0.25 + isActive * 0.5) + aSeed * 6.2832;
        float r = aRadius * (0.85 + isActive * 0.55);
        vec3 p = base + vec3(cos(swirl) * r, sin(swirl) * r, aZ * 0.5);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        float ps = mix(5.0, 13.0, aSeed) * (1.0 + isActive * 1.3);
        gl_PointSize = ps * uPixelRatio * (11.0 / max(0.1, -mv.z));

        vColor = mix(vec3(0.54, 1.0, 0.78), vec3(1.0, 0.68, 0.30), isActive);
        float twinkle = 0.6 + 0.4 * sin(uTime * 1.8 + aSeed * 40.0);
        vAlpha = (isActive > 0.5 ? 1.0 : 0.42) * twinkle;
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
  const orbs = new THREE.Points(geo, mat);
  orbs.frustumCulled = false;
  scene.add(orbs);
  disposables.push(geo, mat);

  // ---- Ambient current drifting behind the grid ---------------------------
  const DUST = 1600;
  const dPos = new Float32Array(DUST * 3);
  const dSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i += 1) {
    dPos[i * 3] = (Math.random() - 0.5) * 24;
    dPos[i * 3 + 1] = (Math.random() - 0.5) * 13;
    dPos[i * 3 + 2] = -2 - Math.random() * 14;
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
        p.x = mod(position.x + uTime * 0.6 + aSeed * 24.0, 24.0) - 12.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.3 + aSeed * 2.4) * uPixelRatio * (10.0 / max(0.1, -mv.z));
        vAlpha = 0.08 + 0.12 * aSeed;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float dist = length(d);
        if (dist > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(0.6, 0.86, 0.78, glow * vAlpha);
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
      uniforms.uActive.value = Math.min(NODES - 1, Math.floor(progress * NODES));

      // keep the grid aligned with the cards: fixed camera, only micro-parallax
      camera.position.x = reducedMotion ? 0 : Math.sin(elapsed * 0.18) * 0.22;
      camera.position.y = reducedMotion ? 0 : Math.cos(elapsed * 0.15) * 0.16;
      camera.position.z = lerp(11.5, 10.6, progress);
      camera.lookAt(0, 0, 0);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    }
  };
}
