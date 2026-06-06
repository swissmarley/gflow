import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createProductScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.048);
  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const worlds: THREE.Group[] = [];
  scene.add(root);

  [0x74ffc0, 0xffad4d].forEach((color, side) => {
    const world = new THREE.Group();
    world.position.x = side === 0 ? -3.5 : 3.5;
    worlds.push(world);
    root.add(world);

    for (let index = 0; index < 9; index += 1) {
      const geometry = new THREE.TorusGeometry(
        1.05 + index * 0.23,
        0.014 + index * 0.002,
        10,
        96
      );
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.11 + index * 0.025,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -index * 0.72;
      ring.rotation.x = 0.2 + index * 0.018;
      world.add(ring);
      geometries.push(geometry);
      materials.push(material);
    }
  });

  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.4, 0, -2.3),
    new THREE.Vector3(-1.1, 0.42, -3.2),
    new THREE.Vector3(0, 0.05, -3.8),
    new THREE.Vector3(1.1, -0.32, -3.2),
    new THREE.Vector3(2.4, 0, -2.3)
  ]);
  const bridgeGeometry = new THREE.TubeGeometry(bridgeCurve, 80, 0.018, 6);
  const bridgeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf2fff8,
    transparent: true,
    opacity: 0.48,
    blending: THREE.AdditiveBlending
  });
  root.add(new THREE.Mesh(bridgeGeometry, bridgeMaterial));
  geometries.push(bridgeGeometry);
  materials.push(bridgeMaterial);

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      const motion = reducedMotion ? 0 : elapsed;
      camera.position.x = THREE.MathUtils.lerp(-1.25, 1.25, progress);
      camera.position.y = Math.sin(progress * Math.PI) * 0.28;
      camera.position.z = THREE.MathUtils.lerp(9, 6.7, progress);
      camera.lookAt(0, 0, -3.2);
      root.rotation.y = Math.sin(progress * Math.PI) * 0.11;
      worlds[0].rotation.z = motion * 0.028;
      worlds[1].rotation.z = motion * -0.023;
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    }
  };
}
