import { useRef, type CSSProperties } from "react";
import { skills } from "../content/siteContent";
import { useChapterSequence } from "../hooks/useChapterSequence";
import { PortalScene } from "./PortalScene";

export function SkillsCurrent() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeSkill = useChapterSequence(sectionRef, skills.length);

  return (
    <section
      className="chapter skills-current"
      id="skills"
      ref={sectionRef}
      aria-labelledby="skills-title"
    >
      <PortalScene
        kind="skills"
        sectionRef={sectionRef}
        label="Twelve creative skills flowing through space"
      />
      <header className="chapter-heading">
        <p>Twelve production disciplines</p>
        <h2 id="skills-title">One current. Every medium.</h2>
      </header>
      <ol className="skill-list">
        {skills.map((skill, index) => (
          <li
            key={skill}
            className={
              index === activeSkill
                ? "is-active"
                : index < activeSkill
                  ? "is-passed"
                  : ""
            }
            style={
              {
                "--skill-top": `${25 + (index % 4) * 14}%`,
                "--skill-left": `${8 + (index / 11) * 84}%`
              } as CSSProperties
            }
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{skill}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
