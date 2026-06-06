import type * as THREE from "three";

export type SceneKind = "products" | "skills" | "quality";

export type SceneRuntime = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (progress: number, elapsed: number, reducedMotion: boolean) => void;
  dispose: () => void;
};

export type SceneFactory = (width: number, height: number) => SceneRuntime;
