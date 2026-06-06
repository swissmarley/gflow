import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { InstallComposer } from "./install/InstallComposer";

export function PortalHero() {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    video.play().catch(() => setVideoReady(false));
  }, [reducedMotion]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reducedMotion) return;

    let visible = true;
    let frame = 0;
    const update = () => {
      const progress = Math.min(
        1,
        Math.max(0, -hero.getBoundingClientRect().top / window.innerHeight)
      );
      hero.style.setProperty("--hero-scale", String(1 + progress * 0.075));
      hero.style.setProperty("--hero-copy-y", `${progress * -52}px`);
      hero.style.setProperty(
        "--hero-copy-opacity",
        String(Math.max(0, 1 - progress * 1.25))
      );
      if (visible) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(update);
    });
    observer.observe(hero);
    frame = requestAnimationFrame(update);

    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <section
      className="portal-hero"
      id="home"
      ref={heroRef}
      aria-labelledby="hero-title"
    >
      <div className="portal-media" aria-hidden="true">
        <img src="/media/portal-poster.jpg" alt="" />
        {!reducedMotion && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/portal-poster.jpg"
            onCanPlay={() => setVideoReady(true)}
            className={videoReady ? "is-ready" : ""}
          >
            <source src="/media/portal-film.webm" type="video/webm" />
            <source src="/media/portal-film.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-orbit" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="hero-content">
        <h1 id="hero-title">From prompt to world.</h1>
        <InstallComposer label="Hero installer" />
        <p className="hero-support">
          Authenticated Flow control and twelve quality-gated creative skills,
          installed together.
        </p>
      </div>
      <a className="scroll-cue" href="#products">
        <span>Scroll to enter</span>
        <i aria-hidden="true" />
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
