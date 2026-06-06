import { useRef } from "react";
import { qualityGates } from "../content/siteContent";
import { useChapterSequence } from "../hooks/useChapterSequence";
import { PortalScene } from "./PortalScene";

export function QualityGates() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeGate = useChapterSequence(sectionRef, qualityGates.length);

  return (
    <section
      className="chapter quality-gates"
      id="quality"
      ref={sectionRef}
      aria-labelledby="quality-title"
    >
      <PortalScene
        kind="quality"
        sectionRef={sectionRef}
        label="Five quality gates in sequence"
      />
      <header className="chapter-heading">
        <p>Quality is structural</p>
        <h2 id="quality-title">Pass through every gate.</h2>
      </header>
      <ol className="gate-list">
        {qualityGates.map((gate, index) => (
          <li
            key={gate.title}
            className={
              index === activeGate
                ? "is-active"
                : index < activeGate
                  ? "is-passed"
                  : ""
            }
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{gate.title}</h3>
              <p>{gate.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
