import * as THREE from "three";
import type { SceneRuntime } from "./types";

const MINT = new THREE.Color(0x8affc6);
const AMBER = new THREE.Color(0xffb453);

const lerp = THREE.MathUtils.lerp;
const smootherstep = THREE.MathUtils.smootherstep;

/**
 * "Convergence" — two luminous particle streams (gflow-cli mint, gflow-skills
 * amber) braid around a shared axis and flow into the distance, merging into a
 * single core. The camera glides forward through the braid as the section
 * scrolls. Glow is shader-driven (soft additive points), no post-processing,
 * so it stays crisp and cheap.
 */
export function createProductScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.026);

  const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 120);
  camera.position.set(0, 0, 10);

  const root = new THREE.Group();
  scene.add(root);

  const pixelRatio = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio : 1,
    1.75
  );

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPixelRatio: { value: pixelRatio }
  };

  const disposables: { dispose: () => void }[] = [];

  // ---- Braided streams -----------------------------------------------------
  const STREAM = 3200;
  const sPos = new Float32Array(STREAM * 3); // unused placeholder for draw count
  const aT = new Float32Array(STREAM);
  const aStrand = new Float32Array(STREAM);
  const aRadius = new Float32Array(STREAM);
  const aSeed = new Float32Array(STREAM);
  const aColor = new Float32Array(STREAM * 3);

  for (let i = 0; i < STREAM; i += 1) {
    const strand = i % 2;
    aStrand[i] = strand;
    aT[i] = Math.random();
    // two concentric bands per strand for ribbon thickness
    aRadius[i] = 2.35 + (Math.random() - 0.5) * 0.7 + (i % 4 < 2 ? 0 : 0.55);
    aSeed[i] = Math.random();
    const c = strand === 0 ? MINT : AMBER;
    aColor[i * 3] = c.r;
    aColor[i * 3 + 1] = c.g;
    aColor[i * 3 + 2] = c.b;
  }

  const streamGeo = new THREE.BufferGeometry();
  streamGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  streamGeo.setAttribute("aT", new THREE.BufferAttribute(aT, 1));
  streamGeo.setAttribute("aStrand", new THREE.BufferAttribute(aStrand, 1));
  streamGeo.setAttribute("aRadius", new THREE.BufferAttribute(aRadius, 1));
  streamGeo.setAttribute("aSeed", new THREE.BufferAttribute(aSeed, 1));
  streamGeo.setAttribute("aColor", new THREE.BufferAttribute(aColor, 3));

  const streamMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uProgress;
      uniform float uPixelRatio;
      attribute float aT;
      attribute float aStrand;
      attribute float aRadius;
      attribute float aSeed;
      attribute vec3 aColor;
      varying vec3 vColor;
      varying float vAlpha;

      const float PI = 3.14159265;

      void main() {
        vColor = aColor;

        float t = fract(aT + uTime * 0.028);

        // depth: near (camera) -> far, with a little extra reach on scroll
        float z = mix(4.0, -34.0 - uProgress * 6.0, t);

        // converge toward the central core as the stream recedes
        float conv = mix(1.0, 0.14, smoothstep(0.0, 1.0, t));
        float r = aRadius * conv;

        float ang = aStrand * PI + t * PI * 7.0 + aSeed * 0.5;
        vec3 p = vec3(cos(ang) * r, sin(ang) * r, z);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        float ps = mix(7.0, 22.0, aSeed);
        gl_PointSize = ps * uPixelRatio * (11.0 / max(0.1, -mv.z));

        float head = smoothstep(0.0, 0.06, t);
        float tail = 1.0 - smoothstep(0.82, 1.0, t);
        float twinkle = 0.6 + 0.4 * sin(uTime * 1.6 + aSeed * 42.0);
        vAlpha = head * tail * twinkle;
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

  const streams = new THREE.Points(streamGeo, streamMat);
  streams.frustumCulled = false;
  root.add(streams);
  disposables.push(streamGeo, streamMat);

  // ---- Ambient drifting dust (depth) --------------------------------------
  const DUST = 1300;
  const dPos = new Float32Array(DUST * 3);
  const dSeed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i += 1) {
    dPos[i * 3] = (Math.random() - 0.5) * 30;
    dPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    dPos[i * 3 + 2] = Math.random() * 40;
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
        // stream gently toward the camera, wrapping
        p.z = mod(position.z + uTime * 0.7, 40.0) - 34.0;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.4 + aSeed * 2.6) * uPixelRatio * (10.0 / max(0.1, -mv.z));
        float near = smoothstep(0.0, 5.0, -mv.z);
        vAlpha = (0.12 + 0.16 * aSeed) * near;
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
  root.add(dust);
  disposables.push(dustGeo, dustMat);

  // ---- Central core glow ---------------------------------------------------
  const coreGeo = new THREE.SphereGeometry(0.5, 24, 24);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xeafff4,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  root.add(core);
  disposables.push(coreGeo, coreMat);

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      uniforms.uTime.value = reducedMotion ? 4.0 : elapsed;
      uniforms.uProgress.value = progress;

      const p = smootherstep(progress, 0, 1);

      camera.position.x = Math.sin(p * Math.PI) * 0.7 + (reducedMotion ? 0 : Math.sin(elapsed * 0.18) * 0.12);
      camera.position.y = -0.35 + Math.sin(p * Math.PI) * 0.45;
      camera.position.z = lerp(10.5, 1.6, p);
      camera.lookAt(0, 0, -9);

      // slow swirl of the whole braid keeps it alive at rest
      root.rotation.z = reducedMotion ? 0 : elapsed * 0.025;

      // the converged core sits deep in the braid and pulses softly
      const coreZ = lerp(-9, -16, p);
      core.position.set(0, 0, coreZ);
      const pulse = reducedMotion ? 1 : 0.85 + Math.sin(elapsed * 1.4) * 0.15;
      core.scale.setScalar(pulse);
    },
    dispose() {
      disposables.forEach((d) => d.dispose());
    }
  };
}
