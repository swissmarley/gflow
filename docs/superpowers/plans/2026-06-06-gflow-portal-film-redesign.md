# gflow Portal Film Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing terminal-dashboard site with the approved full-bleed Portal Film hero, shared two-product installer, and three immersive Three.js scroll chapters.

**Architecture:** Keep `App` as composition glue, move installation behavior into a tested context, and split each narrative chapter into a focused React component. A reusable `PortalScene` runtime owns Three.js setup, progress, visibility pausing, reduced-motion behavior, cleanup, and CSS fallback while scene builders supply product, skills, and quality geometry.

**Tech Stack:** React 18, TypeScript, Vite 6, Three.js, Lucide React, Vitest, Testing Library, FFmpeg, CSS.

---

## File Map

### Application shell

- Modify `src/App.tsx`: replace the monolith with page composition and shared installation provider.
- Modify `src/main.tsx`: keep the root entry and import the new global stylesheet.
- Replace `src/styles.css`: define the cinematic visual system, responsive layouts, chapter geometry, fallbacks, and reduced-motion behavior.
- Create `src/components/SiteHeader.tsx`: fixed minimal navigation.
- Create `src/components/SiteFooter.tsx`: compact project footer.

### Installation domain

- Create `src/install/installConfig.ts`: package-manager and agent types, labels, defaults, and command generation.
- Create `src/install/InstallContext.tsx`: shared package-manager and agent state.
- Create `src/install/installConfig.test.ts`: exhaustive command-generation tests.
- Create `src/components/install/PackageManagerSelect.tsx`: keyboard-accessible package-manager segmented control.
- Create `src/components/install/AgentSelect.tsx`: labeled coding-agent selector.
- Create `src/components/install/InstallComposer.tsx`: command display, copy feedback, and manual-copy fallback.
- Create `src/components/install/InstallComposer.test.tsx`: shared-state and clipboard behavior tests.

### Narrative chapters

- Create `src/components/PortalHero.tsx`: full-viewport video hero and centered installer.
- Create `src/components/ProductWorld.tsx`: connected mint/amber product split and repository links.
- Create `src/components/SkillsCurrent.tsx`: ordered twelve-skill luminous current.
- Create `src/components/QualityGates.tsx`: five spatial quality gates.
- Create `src/components/FinalInstall.tsx`: calm closing CTA with synchronized installer.
- Create `src/content/siteContent.ts`: product, skill, and quality copy in one typed source.

### Three.js runtime

- Create `src/hooks/useReducedMotion.ts`: reactive reduced-motion preference.
- Create `src/hooks/useChapterProgress.ts`: normalized active-section progress using requestAnimationFrame and IntersectionObserver.
- Create `src/hooks/useChapterSequence.ts`: low-frequency active index for skills and quality labels.
- Create `src/scenes/types.ts`: scene runtime contracts.
- Create `src/scenes/productScene.ts`: mint/amber connected product world.
- Create `src/scenes/skillsScene.ts`: flowing twelve-node spatial current.
- Create `src/scenes/qualityScene.ts`: five circular gates and camera pass-through.
- Create `src/components/PortalScene.tsx`: renderer lifecycle, lazy activation, resize, pause, cleanup, and fallback.

### Media

- Create `public/media/portal-master.png`: generated high-resolution source artwork.
- Create `public/media/portal-poster.webp`: first-paint and reduced-motion poster.
- Create `public/media/portal-film.mp4`: eight-second H.264 loop.
- Create `public/media/portal-film.webm`: eight-second VP9 loop.

### Tooling

- Modify `package.json`: add Vitest and Testing Library scripts and development dependencies.
- Modify `vite.config.ts`: add Vitest configuration while preserving chunking.
- Create `src/test/setup.ts`: DOM assertion and browser API setup.

## Task 1: Add the Test Harness and Installation Domain

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/install/installConfig.test.ts`
- Create: `src/install/installConfig.ts`

- [ ] **Step 1: Install the focused test dependencies**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `package.json` and `package-lock.json` include the five development dependencies.

- [ ] **Step 2: Add test scripts and Vitest configuration**

Set the scripts in `package.json` to:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "test": "vitest",
    "test:run": "vitest run",
    "preview": "vite preview"
  }
}
```

Add this property to the object exported from `vite.config.ts`:

```ts
// Replace: import { defineConfig } from "vite";
import { defineConfig } from "vitest/config";

test: {
  environment: "jsdom",
  setupFiles: "./src/test/setup.ts",
  css: true
}
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write the failing exhaustive command test**

Create `src/install/installConfig.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  AGENTS,
  PACKAGE_MANAGERS,
  getInstallCommand,
  type Agent,
  type PackageManager
} from "./installConfig";

const cliCommands: Record<PackageManager, string> = {
  npm: "npm install -g @swissmarley/gflow-cli",
  pnpm: "pnpm add -g @swissmarley/gflow-cli",
  yarn: "yarn global add @swissmarley/gflow-cli",
  bun: "bun add -g @swissmarley/gflow-cli"
};

describe("getInstallCommand", () => {
  it.each(PACKAGE_MANAGERS.flatMap((manager) => AGENTS.map((agent) => [manager, agent] as const)))(
    "builds the combined %s and %s command",
    (manager, agent) => {
      expect(getInstallCommand(manager, agent)).toBe(
        `${cliCommands[manager]} && npx gflow-skills install --agent ${agent}`
      );
    }
  );

  it("keeps agent identifiers lowercase and stable", () => {
    expect(AGENTS satisfies readonly Agent[]).toEqual([
      "codex",
      "claude",
      "cursor",
      "hermes",
      "opencode"
    ]);
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run:

```bash
npm run test:run -- src/install/installConfig.test.ts
```

Expected: FAIL because `src/install/installConfig.ts` does not exist.

- [ ] **Step 5: Implement the installation domain**

Create `src/install/installConfig.ts`:

```ts
export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;
export const AGENTS = ["codex", "claude", "cursor", "hermes", "opencode"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];
export type Agent = (typeof AGENTS)[number];

export const DEFAULT_PACKAGE_MANAGER: PackageManager = "npm";
export const DEFAULT_AGENT: Agent = "codex";

export const AGENT_LABELS: Record<Agent, string> = {
  codex: "Codex",
  claude: "Claude",
  cursor: "Cursor",
  hermes: "Hermes",
  opencode: "OpenCode"
};

const CLI_INSTALL_COMMANDS: Record<PackageManager, string> = {
  npm: "npm install -g @swissmarley/gflow-cli",
  pnpm: "pnpm add -g @swissmarley/gflow-cli",
  yarn: "yarn global add @swissmarley/gflow-cli",
  bun: "bun add -g @swissmarley/gflow-cli"
};

export function getInstallCommand(packageManager: PackageManager, agent: Agent) {
  return `${CLI_INSTALL_COMMANDS[packageManager]} && npx gflow-skills install --agent ${agent}`;
}
```

- [ ] **Step 6: Run the focused test**

Run:

```bash
npm run test:run -- src/install/installConfig.test.ts
```

Expected: PASS with 21 assertions covering all 20 combinations and stable agent identifiers.

- [ ] **Step 7: Commit the domain foundation**

```bash
git add package.json package-lock.json vite.config.ts src/test/setup.ts src/install/installConfig.ts src/install/installConfig.test.ts
git commit -m "test: add installer domain coverage"
```

## Task 2: Build Shared Installer State and Accessible Controls

**Files:**
- Create: `src/install/InstallContext.tsx`
- Create: `src/components/install/PackageManagerSelect.tsx`
- Create: `src/components/install/AgentSelect.tsx`
- Create: `src/components/install/InstallComposer.tsx`
- Create: `src/components/install/InstallComposer.test.tsx`

- [ ] **Step 1: Write the failing shared-state and copy tests**

Create `src/components/install/InstallComposer.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstallProvider } from "../../install/InstallContext";
import { InstallComposer } from "./InstallComposer";

function renderPair() {
  return render(
    <InstallProvider>
      <InstallComposer label="Hero installer" />
      <InstallComposer label="Final installer" />
    </InstallProvider>
  );
}

describe("InstallComposer", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  it("synchronizes package manager and agent across both composers", async () => {
    const user = userEvent.setup();
    renderPair();

    await user.click(screen.getAllByRole("radio", { name: "pnpm" })[0]);
    await user.selectOptions(screen.getAllByRole("combobox", { name: "Coding agent" })[1], "cursor");

    const commands = screen.getAllByTestId("install-command");
    expect(commands[0]).toHaveTextContent(
      "pnpm add -g @swissmarley/gflow-cli && npx gflow-skills install --agent cursor"
    );
    expect(commands[1]).toHaveTextContent(
      "pnpm add -g @swissmarley/gflow-cli && npx gflow-skills install --agent cursor"
    );
  });

  it("copies the active combined command and confirms without changing button width", async () => {
    const user = userEvent.setup();
    renderPair();

    await user.click(screen.getAllByRole("button", { name: "Copy install command" })[0]);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "npm install -g @swissmarley/gflow-cli && npx gflow-skills install --agent codex"
    );
    expect(screen.getAllByRole("button", { name: "Install command copied" })[0]).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test:run -- src/components/install/InstallComposer.test.tsx
```

Expected: FAIL because the provider and components do not exist.

- [ ] **Step 3: Implement the shared provider**

Create `src/install/InstallContext.tsx`:

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_AGENT,
  DEFAULT_PACKAGE_MANAGER,
  getInstallCommand,
  type Agent,
  type PackageManager
} from "./installConfig";

type InstallContextValue = {
  packageManager: PackageManager;
  setPackageManager: (value: PackageManager) => void;
  agent: Agent;
  setAgent: (value: Agent) => void;
  command: string;
};

const InstallContext = createContext<InstallContextValue | null>(null);

export function InstallProvider({ children }: { children: ReactNode }) {
  const [packageManager, setPackageManager] = useState<PackageManager>(DEFAULT_PACKAGE_MANAGER);
  const [agent, setAgent] = useState<Agent>(DEFAULT_AGENT);
  const command = useMemo(() => getInstallCommand(packageManager, agent), [packageManager, agent]);

  return (
    <InstallContext.Provider value={{ packageManager, setPackageManager, agent, setAgent, command }}>
      {children}
    </InstallContext.Provider>
  );
}

export function useInstallConfig() {
  const value = useContext(InstallContext);
  if (!value) throw new Error("useInstallConfig must be used inside InstallProvider");
  return value;
}
```

- [ ] **Step 4: Implement both selectors**

Create `src/components/install/PackageManagerSelect.tsx`:

```tsx
import { useId } from "react";
import { PACKAGE_MANAGERS } from "../../install/installConfig";
import { useInstallConfig } from "../../install/InstallContext";

export function PackageManagerSelect() {
  const { packageManager, setPackageManager } = useInstallConfig();
  const groupName = useId();

  return (
    <fieldset className="package-select">
      <legend>Package manager</legend>
      {PACKAGE_MANAGERS.map((manager) => (
        <label key={manager} className={packageManager === manager ? "is-active" : ""}>
          <input
            type="radio"
            name={groupName}
            value={manager}
            checked={packageManager === manager}
            onChange={() => setPackageManager(manager)}
          />
          <span>{manager}</span>
        </label>
      ))}
    </fieldset>
  );
}
```

Create `src/components/install/AgentSelect.tsx`:

```tsx
import { AGENTS, AGENT_LABELS, type Agent } from "../../install/installConfig";
import { useInstallConfig } from "../../install/InstallContext";

export function AgentSelect() {
  const { agent, setAgent } = useInstallConfig();

  return (
    <label className="agent-select">
      <span>Coding agent</span>
      <select
        aria-label="Coding agent"
        value={agent}
        onChange={(event) => setAgent(event.target.value as Agent)}
      >
        {AGENTS.map((value) => (
          <option value={value} key={value}>
            {AGENT_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 5: Implement copy success and manual-copy fallback**

Create `src/components/install/InstallComposer.tsx`:

```tsx
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInstallConfig } from "../../install/InstallContext";
import { AgentSelect } from "./AgentSelect";
import { PackageManagerSelect } from "./PackageManagerSelect";

type CopyState = "idle" | "copied" | "manual";

export function InstallComposer({ label }: { label: string }) {
  const { command } = useInstallConfig();
  const commandRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const resetLater = () => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopyState("idle"), 1800);
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopyState("copied");
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      if (selection && commandRef.current) {
        range.selectNodeContents(commandRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setCopyState("manual");
    }
    resetLater();
  };

  const buttonLabel =
    copyState === "copied"
      ? "Install command copied"
      : copyState === "manual"
        ? "Command selected for manual copy"
        : "Copy install command";

  return (
    <div className="install-composer" aria-label={label}>
      <div className="install-controls">
        <PackageManagerSelect />
        <AgentSelect />
      </div>
      <div className="command-field">
        <code ref={commandRef} data-testid="install-command">
          {command}
        </code>
        <button type="button" onClick={copyCommand} aria-label={buttonLabel}>
          {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          <span>{copyState === "manual" ? "Selected" : copyState === "copied" ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="copy-status" aria-live="polite">
        {copyState === "manual" ? "Clipboard unavailable. Press Command-C or Control-C." : ""}
      </p>
    </div>
  );
}
```

- [ ] **Step 6: Run the installer tests**

Run:

```bash
npm run test:run -- src/install/installConfig.test.ts src/components/install/InstallComposer.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the shared installer**

```bash
git add src/install/InstallContext.tsx src/components/install
git commit -m "feat: add synchronized install composer"
```

## Task 3: Generate and Encode the Portal Film

**Files:**
- Create: `public/media/portal-master.png`
- Create: `public/media/portal-poster.webp`
- Create: `public/media/portal-film.mp4`
- Create: `public/media/portal-film.webm`

- [ ] **Step 1: Generate the high-resolution portal source**

Use the image generation skill with this exact prompt and save the selected 16:9 result as `public/media/portal-master.png`:

```text
Cinematic abstract portal interior for a premium developer creative-tool website, direct centered view through a monumental dimensional ring, refractive black glass and brushed dark metal, spectral mint light tracing the near ring, restrained warm amber light deep in the tunnel, fine volumetric particles and stretched light trails implying forward camera motion, physically plausible depth, precise architectural geometry, sharp inspectable detail, dramatic but controlled contrast, black negative space for centered white typography and a command bar, no text, no logos, no people, no purple, no blue-purple gradient, ultra-wide 16:9, photorealistic, high-end title sequence frame, 4K.
```

Expected: the ring remains the unmistakable focal point and the center has enough quiet contrast for the installer.

- [ ] **Step 2: Encode the poster**

Run:

```bash
mkdir -p public/media
ffmpeg -y -i public/media/portal-master.png -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" -quality 82 public/media/portal-poster.webp
```

Expected: `public/media/portal-poster.webp` is 1920 by 1080 and visually matches the source.

- [ ] **Step 3: Encode a seamless eight-second H.264 loop**

Run:

```bash
ffmpeg -y -loop 1 -i public/media/portal-master.png -vf "scale=2200:1238:force_original_aspect_ratio=increase,crop=2200:1238,zoompan=z='1.015+0.055*(0.5-0.5*cos(2*PI*on/239))':x='iw/2-(iw/zoom/2)+10*sin(2*PI*on/239)':y='ih/2-(ih/zoom/2)+4*cos(2*PI*on/239)':d=240:s=1920x1080:fps=30,eq=contrast=1.035:saturation=0.94,format=yuv420p" -frames:v 240 -an -c:v libx264 -preset slow -crf 19 -movflags +faststart public/media/portal-film.mp4
```

Expected: an eight-second, 30 fps, silent loop whose first and last frames meet without a visible jump.

- [ ] **Step 4: Encode the VP9 source**

Run:

```bash
ffmpeg -y -i public/media/portal-film.mp4 -an -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -pix_fmt yuv420p public/media/portal-film.webm
```

Expected: WebM playback matches the MP4 framing and duration.

- [ ] **Step 5: Verify media metadata and size**

Run:

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -show_entries format=duration,size -of json public/media/portal-film.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -show_entries format=duration,size -of json public/media/portal-film.webm
```

Expected: both files are 1920 by 1080, 30 fps, approximately eight seconds, and contain no audio stream.

- [ ] **Step 6: Commit the portal media**

```bash
git add public/media
git commit -m "feat: add portal film media"
```

## Task 4: Create the Cinematic Shell and Video Hero

**Files:**
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/PortalHero.tsx`
- Create: `src/hooks/useReducedMotion.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Implement reactive reduced-motion state**

Create `src/hooks/useReducedMotion.ts`:

```ts
import { useEffect, useState } from "react";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
```

- [ ] **Step 2: Create the minimal header**

Create `src/components/SiteHeader.tsx`:

```tsx
import { Github } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="brand" href="#home" aria-label="gflow home">
        <span className="brand-sigil" aria-hidden="true" />
        <span>gflow</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#products">Products</a>
        <a href="#skills">Skills</a>
        <a href="#quality">Quality</a>
      </nav>
      <a
        className="github-link"
        href="https://github.com/swissmarley"
        target="_blank"
        rel="noreferrer"
        aria-label="Open swissmarley on GitHub"
      >
        <Github aria-hidden="true" />
      </a>
    </header>
  );
}
```

- [ ] **Step 3: Create the full-bleed hero**

Create `src/components/PortalHero.tsx`:

```tsx
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
    let visible = false;
    let frame = 0;

    const update = () => {
      const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / window.innerHeight));
      hero.style.setProperty("--hero-scale", String(1 + progress * 0.06));
      hero.style.setProperty("--hero-copy-y", `${progress * -48}px`);
      hero.style.setProperty("--hero-copy-opacity", String(Math.max(0, 1 - progress * 1.2)));
      if (visible) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(update);
    });
    observer.observe(hero);

    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <section className="portal-hero" id="home" ref={heroRef} aria-labelledby="hero-title">
      <div className="portal-media" aria-hidden="true">
        <img src="/media/portal-poster.webp" alt="" />
        {!reducedMotion && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/portal-poster.webp"
            onCanPlay={() => setVideoReady(true)}
            className={videoReady ? "is-ready" : ""}
          >
            <source src="/media/portal-film.webm" type="video/webm" />
            <source src="/media/portal-film.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="hero-vignette" aria-hidden="true" />
      <div className="portal-rings" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-content">
        <p className="eyebrow">gflow-cli + gflow-skills</p>
        <h1 id="hero-title">From prompt to world.</h1>
        <InstallComposer label="Hero installer" />
        <p className="hero-support">
          Authenticated Flow control and twelve quality-gated creative skills, installed together.
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
```

- [ ] **Step 4: Replace the global foundation and hero CSS**

Replace the root, reset, header, installer, and hero portions of `src/styles.css` with these exact design rules, keeping chapter rules for later tasks below them:

```css
:root {
  color-scheme: dark;
  --ink: #020303;
  --ink-soft: #070a08;
  --paper: #f4f8f5;
  --muted: #a6b0aa;
  --faint: #68726c;
  --mint: #8affc6;
  --mint-deep: #31c98c;
  --amber: #ffb453;
  --line: rgba(255, 255, 255, 0.14);
  --max: 1440px;
  font-family: "Avenir Next", "Helvetica Neue", Inter, system-ui, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

* { box-sizing: border-box; }
html { min-width: 320px; background: var(--ink); scroll-behavior: smooth; }
body { min-width: 320px; margin: 0; overflow-x: hidden; color: var(--paper); background: var(--ink); }
button, select { font: inherit; }
button, a, select { -webkit-tap-highlight-color: transparent; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, p, fieldset { margin: 0; }
button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible + span {
  outline: 2px solid var(--mint);
  outline-offset: 3px;
}

.site-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: 76px;
  padding: 0 clamp(20px, 4vw, 64px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(2, 3, 3, 0.78), transparent);
}
.brand { display: inline-flex; align-items: center; gap: 10px; width: max-content; font-weight: 800; }
.brand-sigil {
  width: 12px;
  height: 26px;
  border: 1px solid rgba(138, 255, 198, 0.7);
  border-radius: 50%;
  box-shadow: 0 0 24px rgba(138, 255, 198, 0.45);
}
.site-header nav { display: flex; gap: 28px; color: rgba(255, 255, 255, 0.62); font-size: 0.82rem; }
.github-link { justify-self: end; display: grid; place-items: center; width: 44px; height: 44px; }
.github-link svg { width: 19px; }

.portal-hero {
  --hero-scale: 1;
  --hero-copy-y: 0px;
  --hero-copy-opacity: 1;
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
}
.portal-media, .portal-media img, .portal-media video, .hero-vignette {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.portal-media { transform: scale(var(--hero-scale)); transform-origin: center; will-change: transform; }
.portal-media img, .portal-media video { object-fit: cover; object-position: 50% 50%; }
.portal-media video { opacity: 0; transition: opacity 800ms ease; }
.portal-media video.is-ready { opacity: 1; }
.hero-vignette {
  z-index: 1;
  background:
    radial-gradient(circle at 50% 50%, transparent 0 26%, rgba(2, 3, 3, 0.18) 55%, rgba(2, 3, 3, 0.78) 100%),
    linear-gradient(180deg, rgba(2, 3, 3, 0.35), transparent 28%, transparent 68%, rgba(2, 3, 3, 0.72));
}
.portal-rings { position: absolute; inset: 0; z-index: 2; pointer-events: none; }
.portal-rings span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(74vw, 1040px);
  aspect-ratio: 1;
  border: 1px solid rgba(190, 255, 224, 0.35);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotateX(68deg) rotateZ(-12deg);
  box-shadow: 0 0 46px rgba(91, 255, 183, 0.16), inset 0 0 60px rgba(91, 255, 183, 0.08);
  animation: ring-breathe 8s ease-in-out infinite;
}
.portal-rings span:nth-child(2) { width: min(58vw, 820px); animation-delay: -2.6s; }
.portal-rings span:nth-child(3) { width: min(42vw, 600px); animation-delay: -5.2s; }
.hero-content {
  position: relative;
  z-index: 4;
  width: min(880px, calc(100% - 32px));
  padding-top: 54px;
  text-align: center;
  opacity: var(--hero-copy-opacity);
  transform: translate3d(0, var(--hero-copy-y), 0);
  will-change: opacity, transform;
}
.eyebrow {
  margin-bottom: 18px;
  color: rgba(255, 255, 255, 0.64);
  font-size: 0.72rem;
  font-weight: 760;
  text-transform: uppercase;
}
.hero-content h1 {
  max-width: 800px;
  margin: 0 auto 34px;
  font-size: clamp(3.5rem, 7vw, 6.8rem);
  font-weight: 820;
  line-height: 0.9;
  letter-spacing: 0;
  text-wrap: balance;
}
.install-composer { width: min(820px, 100%); margin: 0 auto; }
.install-controls { display: flex; justify-content: center; gap: 10px; margin-bottom: 10px; }
.package-select {
  display: flex;
  min-height: 44px;
  padding: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(1, 5, 3, 0.52);
  backdrop-filter: blur(18px);
}
.package-select legend, .agent-select > span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.package-select label { position: relative; display: grid; place-items: center; min-width: 58px; cursor: pointer; }
.package-select input { position: absolute; opacity: 0; }
.package-select span { color: rgba(255, 255, 255, 0.54); font-size: 0.76rem; font-weight: 720; }
.package-select .is-active span { color: #07110c; }
.package-select .is-active { border-radius: 4px; background: var(--mint); }
.agent-select select {
  min-width: 138px;
  min-height: 44px;
  padding: 0 34px 0 13px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: var(--paper);
  background: rgba(1, 5, 3, 0.72);
  backdrop-filter: blur(18px);
}
.command-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  min-height: 66px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 7px;
  background: rgba(1, 5, 3, 0.7);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(24px);
}
.command-field code {
  align-self: center;
  min-width: 0;
  padding: 18px 20px;
  overflow-wrap: anywhere;
  color: #effff6;
  font: 600 0.83rem/1.5 "SFMono-Regular", "Cascadia Code", Consolas, monospace;
  text-align: left;
}
.command-field button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 104px;
  min-height: 64px;
  border: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.16);
  color: var(--mint);
  background: rgba(138, 255, 198, 0.06);
  cursor: pointer;
}
.command-field button svg { width: 17px; }
.copy-status { min-height: 18px; margin-top: 7px; color: var(--amber); font-size: 0.75rem; }
.hero-support { max-width: 590px; margin: 8px auto 0; color: rgba(255, 255, 255, 0.58); line-height: 1.55; }
.scroll-cue {
  position: absolute;
  right: clamp(20px, 4vw, 64px);
  bottom: 28px;
  left: clamp(20px, 4vw, 64px);
  z-index: 5;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.48);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}
.scroll-cue i { height: 1px; background: linear-gradient(90deg, var(--mint), rgba(255,255,255,0.12)); }
.scroll-cue svg { width: 16px; }
@keyframes ring-breathe {
  0%, 100% { opacity: 0.48; transform: translate(-50%, -50%) rotateX(68deg) rotateZ(-12deg) scale(0.98); }
  50% { opacity: 0.9; transform: translate(-50%, -50%) rotateX(68deg) rotateZ(-8deg) scale(1.03); }
}
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm run test:run
npm run build
```

Expected: tests pass and the production build succeeds.

- [ ] **Step 6: Commit the shell**

```bash
git add src/components/SiteHeader.tsx src/components/PortalHero.tsx src/hooks/useReducedMotion.ts src/styles.css
git commit -m "feat: build portal film hero"
```

## Task 5: Add the Reusable Three.js Runtime

**Files:**
- Create: `src/hooks/useChapterProgress.ts`
- Create: `src/hooks/useChapterSequence.ts`
- Create: `src/scenes/types.ts`
- Create: `src/components/PortalScene.tsx`

- [ ] **Step 1: Implement visibility and normalized progress**

Create `src/hooks/useChapterProgress.ts`:

```ts
import { useEffect, useRef, useState, type RefObject } from "react";

export function useChapterProgress(sectionRef: RefObject<HTMLElement>) {
  const [active, setActive] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "15% 0px 15% 0px", threshold: 0.01 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [sectionRef]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;

    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(window.innerHeight, rect.height - window.innerHeight);
      progressRef.current = Math.min(1, Math.max(0, -rect.top / travel));
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [active, sectionRef]);

  return { active, progressRef };
}
```

- [ ] **Step 2: Implement threshold-based chapter sequencing**

Create `src/hooks/useChapterSequence.ts`:

```ts
import { useEffect, useState, type RefObject } from "react";

export function useChapterSequence(sectionRef: RefObject<HTMLElement>, count: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;
    let visible = false;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(window.innerHeight, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      const nextIndex = Math.min(count - 1, Math.floor(progress * count));
      setActiveIndex((current) => (current === nextIndex ? current : nextIndex));
      if (visible) frame = requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(update);
    });
    observer.observe(section);

    return () => {
      visible = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [count, sectionRef]);

  return activeIndex;
}
```

- [ ] **Step 3: Define the scene contract**

Create `src/scenes/types.ts`:

```ts
import type * as THREE from "three";

export type SceneKind = "products" | "skills" | "quality";

export type SceneRuntime = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (progress: number, elapsed: number, reducedMotion: boolean) => void;
  dispose: () => void;
};

export type SceneFactory = (width: number, height: number) => SceneRuntime;
```

- [ ] **Step 4: Implement the reusable renderer host**

Create `src/components/PortalScene.tsx`:

```tsx
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { useChapterProgress } from "../hooks/useChapterProgress";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { SceneFactory, SceneKind, SceneRuntime } from "../scenes/types";

async function loadFactory(kind: SceneKind): Promise<SceneFactory> {
  if (kind === "products") return (await import("../scenes/productScene")).createProductScene;
  if (kind === "skills") return (await import("../scenes/skillsScene")).createSkillsScene;
  return (await import("../scenes/qualityScene")).createQualityScene;
}

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
  const { active, progressRef } = useChapterProgress(sectionRef);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let cancelled = false;
    let renderer: THREE.WebGLRenderer | undefined;
    let runtime: SceneRuntime | undefined;
    let frame = 0;

    const resize = () => {
      if (!renderer || !runtime) return;
      const width = section.clientWidth;
      const height = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(width, height, false);
      runtime.camera.aspect = width / height;
      runtime.camera.updateProjectionMatrix();
    };

    const render = () => {
      if (!renderer || !runtime) return;
      runtime.update(progressRef.current, clock.getElapsedTime(), reducedMotion);
      renderer.render(runtime.scene, runtime.camera);
      if (active && !reducedMotion) frame = requestAnimationFrame(render);
    };

    const clock = new THREE.Clock();
    const resizeObserver = new ResizeObserver(resize);

    void loadFactory(kind).then((factory) => {
      if (cancelled) return;
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
      runtime = factory(section.clientWidth, window.innerHeight);
      resizeObserver.observe(section);
      resize();
      render();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      runtime?.dispose();
      renderer?.dispose();
    };
  }, [active, kind, progressRef, reducedMotion, sectionRef]);

  return (
    <div className={`portal-scene portal-scene--${kind}${failed ? " is-fallback" : ""}`}>
      <canvas ref={canvasRef} aria-label={label} role="img" />
    </div>
  );
}
```

- [ ] **Step 5: Add temporary scene modules so the branch builds**

Create `src/scenes/productScene.ts`:

```ts
import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createProductScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 8;
  return {
    scene,
    camera,
    update: () => undefined,
    dispose: () => undefined
  };
}
```

Create `src/scenes/skillsScene.ts`:

```ts
import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createSkillsScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 8;
  return {
    scene,
    camera,
    update: () => undefined,
    dispose: () => undefined
  };
}
```

Create `src/scenes/qualityScene.ts`:

```ts
import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createQualityScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 8;
  return {
    scene,
    camera,
    update: () => undefined,
    dispose: () => undefined
  };
}
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm run test:run
npm run build
```

Expected: PASS and a successful production build.

- [ ] **Step 7: Commit the runtime**

```bash
git add src/hooks src/scenes src/components/PortalScene.tsx
git commit -m "feat: add visible-only three scene runtime"
```

## Task 6: Build the Connected Product World

**Files:**
- Create: `src/content/siteContent.ts`
- Create: `src/components/ProductWorld.tsx`
- Modify: `src/scenes/productScene.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create the typed content source**

Create `src/content/siteContent.ts`:

```ts
export const products = [
  {
    id: "gflow-cli",
    eyebrow: "Authenticated control layer",
    title: "Drive Flow from the terminal.",
    copy:
      "Use your signed-in Chrome session to create images, video, frame-guided motion, and repeatable batch pipelines while keeping Flow's native downloads.",
    command: 'gflow video --id reveal --duration 8 --out ./out',
    href: "https://github.com/swissmarley/gflow-cli",
    accent: "mint"
  },
  {
    id: "gflow-skills",
    eyebrow: "Twelve-skill production system",
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
  { title: "Brief", copy: "Audience, constraints, and success criteria become the production contract." },
  { title: "Generate", copy: "Prompts, settings, references, and outputs stay traceable." },
  { title: "Review", copy: "Visual fidelity, technical accuracy, accessibility, and continuity are inspected." },
  { title: "Refine", copy: "Focused iterations resolve visible issues without losing intent." },
  { title: "Ship", copy: "Production-ready assets, implementation, and handoff leave together." }
] as const;
```

- [ ] **Step 2: Build the product chapter DOM**

Create `src/components/ProductWorld.tsx`:

```tsx
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { products } from "../content/siteContent";
import { PortalScene } from "./PortalScene";

export function ProductWorld() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section className="chapter product-world" id="products" ref={sectionRef} aria-labelledby="products-title">
      <PortalScene kind="products" sectionRef={sectionRef} label="Connected gflow product worlds" />
      <header className="chapter-heading">
        <p>Two products. One creative system.</p>
        <h2 id="products-title">Control the engine. Carry the craft.</h2>
      </header>
      <div className="product-copy-grid">
        {products.map((product) => (
          <article className={`product-copy product-copy--${product.accent}`} key={product.id}>
            <span>{product.id}</span>
            <p className="product-eyebrow">{product.eyebrow}</p>
            <h3>{product.title}</h3>
            <p>{product.copy}</p>
            <code>{product.command}</code>
            <a href={product.href} target="_blank" rel="noreferrer">
              Open repository <ArrowUpRight aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Replace the product scene stub**

Implement `src/scenes/productScene.ts` with:

```ts
import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createProductScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.055);
  const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 80);
  camera.position.set(0, 0, 9);

  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  scene.add(root);

  const colors = [0x74ffc0, 0xffad4d];
  for (let side = 0; side < 2; side += 1) {
    const group = new THREE.Group();
    group.position.x = side === 0 ? -3.4 : 3.4;
    root.add(group);

    for (let index = 0; index < 7; index += 1) {
      const geometry = new THREE.TorusGeometry(1.2 + index * 0.25, 0.015 + index * 0.004, 10, 96);
      const material = new THREE.MeshBasicMaterial({
        color: colors[side],
        transparent: true,
        opacity: 0.12 + index * 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.position.z = -index * 0.85;
      ring.rotation.x = 0.16 + index * 0.025;
      group.add(ring);
      geometries.push(geometry);
      materials.push(material);
    }
  }

  const bridgeGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-2.1, 0, -2.6),
    new THREE.Vector3(0, 0.45, -3.5),
    new THREE.Vector3(2.1, 0, -2.6)
  ]);
  const bridgeMaterial = new THREE.LineBasicMaterial({
    color: 0xf2fff8,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending
  });
  const bridge = new THREE.Line(bridgeGeometry, bridgeMaterial);
  root.add(bridge);
  geometries.push(bridgeGeometry);
  materials.push(bridgeMaterial);

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      const motion = reducedMotion ? 0 : elapsed;
      camera.position.x = THREE.MathUtils.lerp(-1.1, 1.1, progress);
      camera.position.z = THREE.MathUtils.lerp(9, 6.8, progress);
      camera.lookAt(0, 0, -2.8);
      root.rotation.y = Math.sin(progress * Math.PI) * 0.12;
      root.children.forEach((child, index) => {
        if (child instanceof THREE.Group) child.rotation.z = (index ? -1 : 1) * motion * 0.025;
      });
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    }
  };
}
```

- [ ] **Step 4: Add product chapter CSS**

Append:

```css
.chapter { position: relative; min-height: 220svh; overflow: clip; border-top: 1px solid rgba(255,255,255,0.08); }
.portal-scene { position: sticky; top: 0; width: 100%; height: 100svh; }
.portal-scene canvas { display: block; width: 100%; height: 100%; }
.portal-scene.is-fallback { background: radial-gradient(circle at 50% 45%, rgba(92,255,185,0.12), transparent 40%); }
.chapter-heading {
  position: absolute;
  top: 12vh;
  left: max(24px, calc((100vw - var(--max)) / 2));
  z-index: 3;
  max-width: 700px;
}
.chapter-heading > p { margin-bottom: 16px; color: var(--mint); font-size: 0.74rem; font-weight: 760; text-transform: uppercase; }
.chapter-heading h2 { font-size: clamp(2.8rem, 6vw, 6rem); line-height: 0.92; letter-spacing: 0; text-wrap: balance; }
.product-copy-grid {
  position: absolute;
  inset: 0 max(24px, calc((100vw - var(--max)) / 2));
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: clamp(64px, 12vw, 190px);
  pointer-events: none;
}
.product-copy { max-width: 470px; pointer-events: auto; }
.product-copy:nth-child(2) { justify-self: end; }
.product-copy > span { color: var(--mint); font-weight: 820; }
.product-copy--amber > span, .product-copy--amber .product-eyebrow, .product-copy--amber a { color: var(--amber); }
.product-eyebrow { margin-top: 20px; color: var(--mint); font-size: 0.76rem; font-weight: 720; text-transform: uppercase; }
.product-copy h3 { max-width: 420px; margin-top: 12px; font-size: clamp(2.1rem, 4vw, 4.4rem); line-height: 0.96; }
.product-copy > p:not(.product-eyebrow) { max-width: 48ch; margin-top: 20px; color: var(--muted); line-height: 1.65; }
.product-copy code { display: block; margin-top: 22px; color: #e9fff4; font: 600 0.8rem/1.5 "SFMono-Regular", monospace; }
.product-copy a { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin-top: 18px; color: var(--mint); font-weight: 720; }
.product-copy a svg { width: 16px; }
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
npm run test:run
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit the product world**

```bash
git add src/content/siteContent.ts src/components/ProductWorld.tsx src/scenes/productScene.ts src/styles.css
git commit -m "feat: add connected product world"
```

## Task 7: Build the Twelve-Skill Current

**Files:**
- Create: `src/components/SkillsCurrent.tsx`
- Modify: `src/scenes/skillsScene.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create the ordered skills chapter**

Create `src/components/SkillsCurrent.tsx`:

```tsx
import { useRef, type CSSProperties } from "react";
import { skills } from "../content/siteContent";
import { useChapterSequence } from "../hooks/useChapterSequence";
import { PortalScene } from "./PortalScene";

export function SkillsCurrent() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeSkill = useChapterSequence(sectionRef, skills.length);

  return (
    <section className="chapter skills-current" id="skills" ref={sectionRef} aria-labelledby="skills-title">
      <PortalScene kind="skills" sectionRef={sectionRef} label="Twelve creative skills flowing through space" />
      <header className="chapter-heading">
        <p>Twelve production disciplines</p>
        <h2 id="skills-title">One current. Every medium.</h2>
      </header>
      <ol className="skill-list">
        {skills.map((skill, index) => (
          <li
            key={skill}
            className={index === activeSkill ? "is-active" : index < activeSkill ? "is-passed" : ""}
            style={{
              "--skill-top": `${24 + (index % 4) * 15}%`,
              "--skill-left": `${8 + (index / 11) * 80}%`
            } as CSSProperties}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{skill}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 2: Replace the skills scene stub**

Implement `src/scenes/skillsScene.ts`:

```ts
import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createSkillsScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.045);
  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 120);
  camera.position.set(0, 0.4, 9);
  const root = new THREE.Group();
  scene.add(root);

  const points: THREE.Vector3[] = [];
  for (let index = 0; index < 48; index += 1) {
    const t = index / 47;
    points.push(new THREE.Vector3((t - 0.5) * 26, Math.sin(t * Math.PI * 3) * 1.4, -t * 22));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, 240, 0.055, 10, false);
  const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x7dffc3,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending
  });
  root.add(new THREE.Mesh(tubeGeometry, tubeMaterial));

  const nodeGeometry = new THREE.IcosahedronGeometry(0.17, 1);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xffb453 });
  for (let index = 0; index < 12; index += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(curve.getPoint(index / 11));
    node.userData.index = index;
    root.add(node);
  }

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      const current = curve.getPoint(THREE.MathUtils.lerp(0.03, 0.95, progress));
      const ahead = curve.getPoint(THREE.MathUtils.lerp(0.08, 1, progress));
      camera.position.lerp(new THREE.Vector3(current.x, current.y + 1.1, current.z + 5.2), 0.08);
      camera.lookAt(ahead);
      root.children.forEach((child) => {
        if (child instanceof THREE.Mesh && typeof child.userData.index === "number") {
          const distance = Math.abs(progress * 11 - child.userData.index);
          const scale = 1 + Math.max(0, 1 - distance) * 1.6;
          child.scale.setScalar(scale);
          if (!reducedMotion) child.rotation.y = elapsed * 0.5;
        }
      });
    },
    dispose() {
      tubeGeometry.dispose();
      tubeMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
    }
  };
}
```

- [ ] **Step 3: Add the flowing-label CSS**

Append:

```css
.skills-current { min-height: 260svh; background: linear-gradient(180deg, #020303, #040806 52%, #020303); }
.skill-list { position: absolute; inset: 0; z-index: 3; margin: 0; padding: 0; list-style: none; pointer-events: none; }
.skill-list li {
  position: absolute;
  top: var(--skill-top);
  left: var(--skill-left);
  display: grid;
  gap: 5px;
  max-width: 150px;
  color: rgba(255, 255, 255, 0.3);
  transform: translateX(-50%);
  transition: color 240ms ease, opacity 240ms ease, transform 240ms ease;
}
.skill-list li span { color: var(--mint); font: 650 0.68rem/1 "SFMono-Regular", monospace; }
.skill-list li strong { font-size: clamp(0.76rem, 1.1vw, 1rem); line-height: 1.2; }
.skill-list li:nth-child(3n) strong, .skill-list li:nth-child(5n) strong { color: rgba(255, 180, 83, 0.72); }
.skill-list li.is-passed { color: rgba(255,255,255,0.58); }
.skill-list li.is-active { color: var(--paper); transform: translateX(-50%) scale(1.08); }
```

- [ ] **Step 4: Run tests and build**

Run:

```bash
npm run test:run
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit the skills current**

```bash
git add src/components/SkillsCurrent.tsx src/scenes/skillsScene.ts src/styles.css
git commit -m "feat: add immersive skills current"
```

## Task 8: Build the Five Quality Gates

**Files:**
- Create: `src/components/QualityGates.tsx`
- Modify: `src/scenes/qualityScene.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create the gate narrative**

Create `src/components/QualityGates.tsx`:

```tsx
import { useRef } from "react";
import { qualityGates } from "../content/siteContent";
import { useChapterSequence } from "../hooks/useChapterSequence";
import { PortalScene } from "./PortalScene";

export function QualityGates() {
  const sectionRef = useRef<HTMLElement>(null);
  const activeGate = useChapterSequence(sectionRef, qualityGates.length);

  return (
    <section className="chapter quality-gates" id="quality" ref={sectionRef} aria-labelledby="quality-title">
      <PortalScene kind="quality" sectionRef={sectionRef} label="Five quality gates in sequence" />
      <header className="chapter-heading">
        <p>Quality is structural</p>
        <h2 id="quality-title">Pass through every gate.</h2>
      </header>
      <ol className="gate-list">
        {qualityGates.map((gate, index) => (
          <li
            key={gate.title}
            className={index === activeGate ? "is-active" : index < activeGate ? "is-passed" : ""}
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
```

- [ ] **Step 2: Replace the quality scene stub**

Implement `src/scenes/qualityScene.ts`:

```ts
import * as THREE from "three";
import type { SceneRuntime } from "./types";

export function createQualityScene(width: number, height: number): SceneRuntime {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020303, 0.04);
  const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 90);
  camera.position.set(0, 0, 9);
  const root = new THREE.Group();
  scene.add(root);

  const geometries: THREE.TorusGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  const gates: THREE.Mesh[] = [];

  for (let index = 0; index < 5; index += 1) {
    const geometry = new THREE.TorusGeometry(2.2, 0.055, 16, 128);
    const material = new THREE.MeshBasicMaterial({
      color: index === 2 ? 0xffb453 : 0x83ffc7,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending
    });
    const gate = new THREE.Mesh(geometry, material);
    gate.position.set(Math.sin(index * 1.8) * 0.65, Math.cos(index * 1.2) * 0.25, -index * 10);
    gate.rotation.z = (index - 2) * 0.05;
    gate.userData.baseRotation = gate.rotation.z;
    root.add(gate);
    gates.push(gate);
    geometries.push(geometry);
    materials.push(material);
  }

  return {
    scene,
    camera,
    update(progress, elapsed, reducedMotion) {
      camera.position.z = THREE.MathUtils.lerp(9, -39, progress);
      camera.position.x = Math.sin(progress * Math.PI * 4) * 0.35;
      camera.lookAt(0, 0, camera.position.z - 8);
      gates.forEach((gate, index) => {
        const distance = Math.abs(camera.position.z - gate.position.z);
        (gate.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.max(0, 1 - distance / 8) * 0.72;
        gate.rotation.z =
          gate.userData.baseRotation + (reducedMotion ? 0 : elapsed * 0.05 * (index % 2 ? -1 : 1));
      });
    },
    dispose() {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
    }
  };
}
```

- [ ] **Step 3: Add quality-gate CSS**

Append:

```css
.quality-gates { min-height: 250svh; background: #020303; }
.gate-list {
  position: absolute;
  inset: 0 max(24px, calc((100vw - var(--max)) / 2));
  z-index: 3;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: end;
  gap: 20px;
  margin: 0;
  padding: 0 0 12vh;
  list-style: none;
  pointer-events: none;
}
.gate-list li { display: grid; gap: 16px; min-width: 0; opacity: 0.32; transition: opacity 240ms ease, transform 240ms ease; }
.gate-list li > span { color: var(--mint); font: 650 0.7rem/1 "SFMono-Regular", monospace; }
.gate-list h3 { font-size: clamp(1.3rem, 2vw, 2.2rem); }
.gate-list p { margin-top: 10px; color: var(--muted); font-size: 0.88rem; line-height: 1.55; }
.gate-list li:nth-child(3) > span, .gate-list li:nth-child(3) h3 { color: var(--amber); }
.gate-list li.is-passed { opacity: 0.62; }
.gate-list li.is-active { opacity: 1; transform: translateY(-10px); }
```

- [ ] **Step 4: Run tests and build**

Run:

```bash
npm run test:run
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit the quality gates**

```bash
git add src/components/QualityGates.tsx src/scenes/qualityScene.ts src/styles.css
git commit -m "feat: add spatial quality gates"
```

## Task 9: Compose the Final Page and Synchronized CTA

**Files:**
- Create: `src/components/FinalInstall.tsx`
- Create: `src/components/SiteFooter.tsx`
- Replace: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create the closing installation chapter**

Create `src/components/FinalInstall.tsx`:

```tsx
import { ArrowUpRight } from "lucide-react";
import { InstallComposer } from "./install/InstallComposer";

export function FinalInstall() {
  return (
    <section className="final-install" id="install" aria-labelledby="install-title">
      <div className="final-glow" aria-hidden="true" />
      <div className="final-install__content">
        <p className="eyebrow">Both products. One line.</p>
        <h2 id="install-title">Enter the creative flow.</h2>
        <p className="final-lede">
          Install authenticated Flow control and the complete agent skill system with one synchronized command.
        </p>
        <InstallComposer label="Final installer" />
        <div className="repo-links">
          <a href="https://github.com/swissmarley/gflow-cli" target="_blank" rel="noreferrer">
            gflow-cli <ArrowUpRight aria-hidden="true" />
          </a>
          <a href="https://github.com/swissmarley/gflow-skills" target="_blank" rel="noreferrer">
            gflow-skills <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the compact footer**

Create `src/components/SiteFooter.tsx`:

```tsx
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <a className="brand" href="#home" aria-label="gflow home">
        <span className="brand-sigil" aria-hidden="true" />
        <span>gflow</span>
      </a>
      <p>Open-source creative tooling by swissmarley.</p>
      <p>{new Date().getFullYear()}</p>
    </footer>
  );
}
```

- [ ] **Step 3: Replace the application monolith**

Replace `src/App.tsx`:

```tsx
import { FinalInstall } from "./components/FinalInstall";
import { PortalHero } from "./components/PortalHero";
import { ProductWorld } from "./components/ProductWorld";
import { QualityGates } from "./components/QualityGates";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SkillsCurrent } from "./components/SkillsCurrent";
import { InstallProvider } from "./install/InstallContext";

export default function App() {
  return (
    <InstallProvider>
      <SiteHeader />
      <main>
        <PortalHero />
        <ProductWorld />
        <SkillsCurrent />
        <QualityGates />
        <FinalInstall />
      </main>
      <SiteFooter />
    </InstallProvider>
  );
}
```

- [ ] **Step 4: Add final CTA and footer CSS**

Append:

```css
.final-install {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 100svh;
  overflow: hidden;
  padding: 120px 24px;
  border-top: 1px solid rgba(255,255,255,0.08);
  background: #030504;
}
.final-glow {
  position: absolute;
  width: min(72vw, 960px);
  aspect-ratio: 1;
  border: 1px solid rgba(138,255,198,0.22);
  border-radius: 50%;
  box-shadow: 0 0 120px rgba(81,255,177,0.1), inset 0 0 90px rgba(81,255,177,0.07);
  transform: rotateX(70deg);
}
.final-install__content { position: relative; z-index: 2; width: min(900px, 100%); text-align: center; }
.final-install h2 { font-size: clamp(3.2rem, 7vw, 7rem); line-height: 0.9; letter-spacing: 0; }
.final-lede { max-width: 590px; margin: 22px auto 34px; color: var(--muted); line-height: 1.65; }
.repo-links { display: flex; justify-content: center; gap: 28px; margin-top: 30px; }
.repo-links a { display: inline-flex; align-items: center; gap: 7px; min-height: 44px; color: var(--muted); font-weight: 720; }
.repo-links a svg { width: 16px; }
.site-footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
  min-height: 110px;
  padding: 24px clamp(20px, 4vw, 64px);
  border-top: 1px solid rgba(255,255,255,0.08);
  color: var(--faint);
  font-size: 0.8rem;
}
.site-footer p:last-child { justify-self: end; }
```

- [ ] **Step 5: Run the full automated checks**

Run:

```bash
npm run test:run
npm run build
```

Expected: PASS with no TypeScript or Vite errors.

- [ ] **Step 6: Commit the complete page composition**

```bash
git add src/App.tsx src/components/FinalInstall.tsx src/components/SiteFooter.tsx src/styles.css
git commit -m "feat: compose portal film experience"
```

## Task 10: Finish Responsive, Reduced-Motion, and Fallback Behavior

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/PortalScene.tsx`
- Modify: `src/components/PortalHero.tsx`

- [ ] **Step 1: Add tablet and mobile composition rules**

Append:

```css
@media (max-width: 980px) {
  .chapter { min-height: 180svh; }
  .product-copy-grid { grid-template-columns: 1fr; align-content: center; gap: 18vh; }
  .product-copy:nth-child(2) { justify-self: end; }
  .gate-list { grid-template-columns: repeat(3, 1fr); row-gap: 28px; }
}

@media (max-width: 680px) {
  .site-header { grid-template-columns: 1fr auto; min-height: 66px; padding-inline: 16px; }
  .site-header nav { display: none; }
  .hero-content { width: min(100% - 24px, 560px); padding-top: 42px; }
  .hero-content h1 { margin-bottom: 28px; font-size: clamp(3rem, 15vw, 4.7rem); }
  .portal-media img, .portal-media video { object-position: 52% 50%; }
  .portal-rings span { width: 120vw; }
  .install-controls { align-items: stretch; }
  .package-select { flex: 1; }
  .package-select label { min-width: 0; flex: 1; }
  .agent-select select { min-width: 128px; }
  .command-field { min-height: 76px; }
  .command-field code { padding: 14px; font-size: 0.72rem; }
  .command-field button { width: 58px; min-height: 74px; }
  .command-field button span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  .hero-support { font-size: 0.86rem; }
  .scroll-cue { right: 16px; bottom: 18px; left: 16px; }
  .chapter { min-height: 220svh; }
  .chapter-heading { top: 10vh; left: 18px; right: 18px; }
  .chapter-heading h2 { font-size: clamp(2.6rem, 13vw, 4.4rem); }
  .product-copy-grid { inset: 0 18px; justify-items: start; gap: 32vh; padding-top: 34vh; }
  .product-copy:nth-child(2) { justify-self: start; }
  .product-copy h3 { font-size: clamp(2.2rem, 11vw, 3.6rem); }
  .skills-current { min-height: 250svh; }
  .skill-list {
    top: 33vh;
    right: 18px;
    bottom: 12vh;
    left: 18px;
    display: grid;
    align-content: space-between;
  }
  .skill-list li {
    position: static;
    grid-template-columns: 36px 1fr;
    max-width: none;
    transform: none;
  }
  .skill-list li.is-active { transform: none; }
  .gate-list {
    inset: 34vh 18px 10vh;
    grid-template-columns: 1fr;
    align-content: space-between;
    padding: 0;
  }
  .gate-list li { grid-template-columns: 36px 1fr; }
  .gate-list li.is-active { transform: none; }
  .gate-list p { max-width: 44ch; }
  .final-install { padding-inline: 12px; }
  .final-install h2 { font-size: clamp(3rem, 15vw, 4.8rem); }
  .repo-links { flex-direction: column; align-items: center; gap: 4px; }
  .site-footer { grid-template-columns: 1fr auto; }
  .site-footer p:first-of-type { display: none; }
}
```

- [ ] **Step 2: Add reduced-motion and fallback CSS**

Append:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
  .chapter { min-height: auto; padding: 120px 0; }
  .portal-scene { position: absolute; inset: 0; height: 100%; opacity: 0.55; }
  .chapter-heading, .product-copy-grid, .skill-list, .gate-list {
    position: relative;
    inset: auto;
  }
  .chapter-heading, .product-copy-grid, .skill-list, .gate-list {
    width: min(calc(100% - 36px), var(--max));
    margin-inline: auto;
  }
  .product-copy-grid { margin-top: 80px; }
  .skill-list, .gate-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px; margin-top: 80px; }
  .skill-list li { position: static; transform: none; }
  .skill-list li.is-active, .gate-list li.is-active { transform: none; }
}
```

- [ ] **Step 3: Keep fallback content visible when WebGL is unavailable**

In `src/components/PortalScene.tsx`, change the returned fallback wrapper to:

```tsx
return (
  <div
    className={`portal-scene portal-scene--${kind}${failed ? " is-fallback" : ""}`}
    data-webgl={failed ? "unavailable" : "ready"}
  >
    {!failed && <canvas ref={canvasRef} aria-label={label} role="img" />}
  </div>
);
```

Move the renderer initialization effect behind a canvas null check before constructing Three.js. Verify that DOM headings, lists, links, selectors, and commands remain outside the canvas in every chapter.

- [ ] **Step 4: Validate no horizontal overflow in code**

Run:

```bash
npm run test:run
npm run build
```

Expected: PASS. Browser verification in Task 11 must confirm `document.documentElement.scrollWidth === window.innerWidth` at both target viewports.

- [ ] **Step 5: Commit responsive and fallback behavior**

```bash
git add src/styles.css src/components/PortalScene.tsx src/components/PortalHero.tsx
git commit -m "fix: harden motion and responsive fallbacks"
```

## Task 11: Browser Fidelity, Interaction, and Performance Verification

**Files:**
- Modify as findings require: `src/styles.css`
- Modify as findings require: `src/components/*.tsx`
- Modify as findings require: `src/scenes/*.ts`

- [ ] **Step 1: Start the production-shaped local server**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 58222
```

Expected: Vite serves `http://127.0.0.1:58222/`.

- [ ] **Step 2: Verify the desktop first viewport**

Use the in-app Browser at 1440 by 1000 and inspect `http://127.0.0.1:58222/`.

Expected:

- Portal film fills the viewport and is visibly crisp before and after video readiness.
- `From prompt to world.` and the installer are centered without covering the portal focal point.
- Header is minimal, not a floating glass card.
- No terminal dashboard, preview cards, or card grid remains.
- Copy button, package controls, and agent selector all meet 44-pixel targets.

- [ ] **Step 3: Verify all installer combinations and shared state**

In the browser:

1. Select each package manager.
2. Select each agent.
3. Confirm the command updates immediately.
4. Scroll to the final CTA.
5. Confirm the same values are selected there.
6. Copy once from the final CTA and confirm the copied state does not resize the command field.

Expected: all 20 combinations match `getInstallCommand`.

- [ ] **Step 4: Verify all immersive chapters**

Scroll slowly through the product, skills, and quality chapters.

Expected:

- Product camera travels between mint and amber environments.
- Both repository links remain usable.
- All twelve skill names appear in the approved order.
- The current moves smoothly without horizontal document overflow.
- Five gates activate in order: Brief, Generate, Review, Refine, Ship.
- No chapter keeps animating after it leaves the visibility margin.

- [ ] **Step 5: Verify mobile at 390 by 844**

Use the in-app Browser at 390 by 844.

Expected:

- Hero is full-height and the portal remains behind the installer.
- Heading, selectors, command, and copy icon fit without overlap.
- Product environments stack.
- Skills become a vertical current.
- Gates become a vertical sequence.
- `document.documentElement.scrollWidth === window.innerWidth`.

- [ ] **Step 6: Verify reduced motion and failure modes**

Emulate `prefers-reduced-motion: reduce`, reload, and inspect every chapter.

Expected:

- Poster replaces autoplay storytelling.
- Portal ring animation and scrubbed camera movement stop.
- Every heading, list, command, selector, and link remains readable.
- Blocking WebGL initialization still leaves CSS backgrounds and all DOM content visible.
- Blocking clipboard permission selects the command and announces manual copy.

- [ ] **Step 7: Inspect runtime health**

Check the browser console and network panel.

Expected:

- No React, Three.js, media, source-map, or accessibility errors.
- Poster loads before video readiness.
- MP4 or WebM loads successfully.
- Device pixel ratio is capped at 1.75.
- No requestAnimationFrame loop continues for offscreen scenes.

- [ ] **Step 8: Run final automated verification**

Run:

```bash
npm run test:run
npm run build
git status --short
```

Expected: tests pass, production build succeeds, and only intentional browser-polish changes remain.

- [ ] **Step 9: Commit browser-polish changes**

```bash
git add src public package.json package-lock.json vite.config.ts
git commit -m "fix: polish portal film browser fidelity"
```

## Completion Criteria

- The hero uses the generated portal film with poster, WebM, and MP4 fallbacks.
- The combined installer always installs `gflow-cli` and `gflow-skills`.
- npm, pnpm, yarn, and bun work with Codex, Claude, Cursor, Hermes, and OpenCode.
- Hero and final CTA share state.
- Product, skills, and quality chapters use visible-only Three.js scenes.
- Reduced motion, failed video, failed WebGL, and failed clipboard paths preserve the experience.
- Desktop and mobile visual checks pass with no horizontal overflow or incoherent overlap.
- `npm run test:run` and `npm run build` pass.
