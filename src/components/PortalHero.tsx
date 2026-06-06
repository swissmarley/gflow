import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { asset } from "../asset";
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

    const play = () => {
      video.play().catch(() => undefined);
    };
    play();

    const onVisible = () => {
      if (document.visibilityState === "visible") play();
    };
    document.addEventListener("visibilitychange", onVisible);
    video.addEventListener("canplay", play);
    video.addEventListener("pause", play);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      video.removeEventListener("canplay", play);
      video.removeEventListener("pause", play);
    };
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
      hero.style.setProperty("--hero-scale", String(1 + progress * 0.05));
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
        <img src={asset("media/portal-poster.jpg")} alt="" />
        {!reducedMotion && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster={asset("media/portal-poster.jpg")}
            onCanPlay={() => setVideoReady(true)}
            className={videoReady ? "is-ready" : ""}
          >
            <source src={asset("media/portal-film.webm")} type="video/webm" />
            <source src={asset("media/portal-film.mp4")} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      <div className="hero-content">
        <h1 id="hero-title">Run Flow like a studio.</h1>
        <InstallComposer label="Hero installer" showPackageManager={false} />
        <p className="hero-support">
          Authenticated Flow control plus twelve quality-gated creative skills
          for your coding agent.
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
