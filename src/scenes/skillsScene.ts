import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createSkillsScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.04);
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120);
  const root = new THREE.Group();
  scene.add(root);

  const curve = new THREE.CatmullRomCurve3(
    Array.from({ length: 48 }, (_, index) => {
      const t = index / 47;
      return new THREE.Vector3(
        (t - 0.5) * 26,
        Math.sin(t * Math.PI * 3.2) * 1.35,
        -t * 22
      );
    })
  );
  const tubeGeometry = new THREE.TubeGeometry(curve, 240, 0.045, 8);
  const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x7dffc3,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending
  });
  root.add(new THREE.Mesh(tubeGeometry, tubeMaterial));

  const echoGeometry = new THREE.TubeGeometry(curve, 240, 0.13, 8);
  const echoMaterial = new THREE.MeshBasicMaterial({
    color: 0x43c98e,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending
  });
  root.add(new THREE.Mesh(echoGeometry, echoMaterial));

  const nodeGeometry = new THREE.IcosahedronGeometry(0.085, 1);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffb453 });
  const nodes: THREE.Mesh[] = [];
  for (let index = 0; index < 12; index += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(curve.getPoint(index / 11));
    nodes.push(node);
    root.add(node);
  }

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      const current = curve.getPoint(THREE.MathUtils.lerp(0.02, 0.92, progress));
      const ahead = curve.getPoint(THREE.MathUtils.lerp(0.08, 0.99, progress));
      camera.position.lerp(
        new THREE.Vector3(current.x, current.y + 1.05, current.z + 5),
        reducedMotion ? 1 : 0.075
      );
      camera.lookAt(ahead);
      nodes.forEach((node, index) => {
        const distance = Math.abs(progress * 11 - index);
        node.scale.setScalar(1 + Math.max(0, 1 - distance) * 1.9);
        if (!reducedMotion) node.rotation.y = elapsed * 0.55;
      });
    },
    dispose() {
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      echoGeometry.dispose();
      echoMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
    }
  };
}
