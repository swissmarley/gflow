import {
  Building2,
  Clapperboard,
  FileText,
  Fingerprint,
  Gamepad2,
  Globe,
  Music,
  Newspaper,
  Package,
  Share2,
  Sparkles,
  Users,
  type LucideIcon
} from "lucide-react";
import { useRef } from "react";
import { skills } from "../content/siteContent";
import { useChapterSequence } from "../hooks/useChapterSequence";
import { PortalScene } from "./PortalScene";

const SKILL_ICONS: LucideIcon[] = [
  Globe,
  Clapperboard,
  Sparkles,
  Package,
  Fingerprint,
  Users,
  Newspaper,
  Building2,
  Gamepad2,
  Share2,
  FileText,
  Music
];

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
      <ol className="skill-grid">
        {skills.map((skill, index) => {
          const Icon = SKILL_ICONS[index];
          return (
            <li
              key={skill}
              className={
                index === activeSkill
                  ? "is-active"
                  : index < activeSkill
                    ? "is-passed"
                    : ""
              }
            >
              <div className="skill-card-top">
                <Icon aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <strong>{skill}</strong>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
