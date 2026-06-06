export const products = [
  {
    id: "gflow-cli",
    label: "Authenticated control layer",
    title: "Drive Flow from the terminal.",
    copy:
      "Use your signed-in Chrome session to create images, video, frame-guided motion, and repeatable batch pipelines while keeping Flow's native downloads.",
    command: 'gflow video --id reveal --duration 8 --out ./out',
    href: "https://github.com/swissmarley/gflow-cli",
    accent: "mint"
  },
  {
    id: "gflow-skills",
    label: "Twelve-skill production system",
    title: "Give agents a creative practice.",
    copy:
      "Install foundation and production skills for immersive web, film, motion, product, identity, characters, editorial, architecture, games, social, documents, and music video.",
    command: "npx gflow-skills install --agent codex",
    href: "https://github.com/swissmarley/gflow-skills",
    accent: "amber"
  }
] as const;

export const skills = [
  "Immersive Web",
  "Cinema Production",
  "Motion Graphics",
  "Product Visuals",
  "Brand Identity",
  "Character Pipeline",
  "Editorial Design",
  "Architectural Visualization",
  "Game Assets",
  "Social Content",
  "Design Documents",
  "Music Video"
] as const;

export const qualityGates = [
  {
    title: "Brief",
    copy: "Audience, constraints, and success criteria become the production contract."
  },
  {
    title: "Generate",
    copy: "Prompts, settings, references, and outputs stay traceable."
  },
  {
    title: "Review",
    copy: "Visual fidelity, technical accuracy, accessibility, and continuity are inspected."
  },
  {
    title: "Refine",
    copy: "Focused iterations resolve visible issues without losing intent."
  },
  {
    title: "Ship",
    copy: "Production-ready assets, implementation, and handoff leave together."
  }
] as const;
