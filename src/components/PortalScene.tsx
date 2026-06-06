import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { createProductScene } from "../scenes/productScene";
import { createQualityScene } from "../scenes/qualityScene";
import { createSkillsScene } from "../scenes/skillsScene";
import type { SceneFactory, SceneKind } from "../scenes/types";

const factories: Record<SceneKind, SceneFactory> = {
  products: createProductScene,
  skills: createSkillsScene,
  quality: createQualityScene
};

export function PortalScene({
  kind,
  sectionRef,
  label
}: {
  kind: SceneKind;
  sectionRef: RefObject<HTMLElement>;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch {
      setFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const runtime = factories[kind](section.clientWidth, window.innerHeight);
    const clock = new THREE.Clock();
    let frame = 0;
    let active = false;

    const resize = () => {
      const width = section.clientWidth;
      const height = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(width, height, false);
      runtime.camera.aspect = width / height;
      runtime.camera.updateProjectionMatrix();
    };

    const getProgress = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(window.innerHeight, rect.height - window.innerHeight);
      return Math.min(1, Math.max(0, -rect.top / travel));
    };

    const render = () => {
      runtime.update(getProgress(), clock.getElapsedTime(), reducedMotion);
      renderer.render(runtime.scene, runtime.camera);
      if (active && !reducedMotion) frame = requestAnimationFrame(render);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        cancelAnimationFrame(frame);
        if (active) {
          render();
        }
      },
      { rootMargin: "20% 0px", threshold: 0.01 }
    );
    const resizeObserver = new ResizeObserver(resize);

    observer.observe(section);
    resizeObserver.observe(section);
    resize();
    render();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      runtime.dispose();
      renderer.dispose();
    };
  }, [kind, reducedMotion, sectionRef]);

  return (
    <div
      className={`portal-scene portal-scene--${kind}${failed ? " is-fallback" : ""}`}
      data-webgl={failed ? "unavailable" : "ready"}
    >
      <canvas ref={canvasRef} aria-label={label} role="img" />
    </div>
  );
}
