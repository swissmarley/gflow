import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createQualityScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.035);
  const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 90);
  const geometries: THREE.TorusGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  const gates: THREE.Mesh[] = [];

  for (let index = 0; index < 5; index += 1) {
    const geometry = new THREE.TorusGeometry(2.15, 0.05, 16, 128);
    const material = new THREE.MeshBasicMaterial({
      color: index === 2 ? 0xffb453 : 0x83ffc7,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    const gate = new THREE.Mesh(geometry, material);
    gate.position.set(
      Math.sin(index * 1.8) * 0.55,
      Math.cos(index * 1.2) * 0.22,
      -index * 10
    );
    gate.userData.baseRotation = (index - 2) * 0.05;
    scene.add(gate);
    gates.push(gate);
    geometries.push(geometry);
    materials.push(material);
  }

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      camera.position.z = THREE.MathUtils.lerp(9, -39, progress);
      camera.position.x = Math.sin(progress * Math.PI * 4) * 0.3;
      camera.lookAt(0, 0, camera.position.z - 8);
      gates.forEach((gate, index) => {
        const distance = Math.abs(camera.position.z - gate.position.z);
        (gate.material as THREE.MeshBasicMaterial).opacity =
          0.16 + Math.max(0, 1 - distance / 8) * 0.82;
        gate.rotation.z =
          gate.userData.baseRotation +
          (reducedMotion ? 0 : elapsed * 0.045 * (index % 2 ? -1 : 1));
      });
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    }
  };
}
