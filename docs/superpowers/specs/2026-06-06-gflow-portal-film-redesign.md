# gflow Portal Film Redesign

## Status

Approved visual direction on June 6, 2026.

The redesign replaces the current terminal-dashboard aesthetic with a cinematic, video-first experience called **Portal Film**, followed by four spatial scroll chapters. The website remains a focused product site for `gflow-cli` and `gflow-skills`.

## Goals

- Make the hero feel cinematic and immediately immersive.
- Use a full-bleed portal video as the dominant first-viewport experience.
- Put a combined installer for both products at the center of the hero.
- Let visitors select their package manager and coding agent before copying the command.
- Replace oversized glass panels and repeated cards with open, spatial compositions.
- Improve the 3D experience so it drives the narrative instead of acting as background decoration.
- Preserve accurate product language from the two upstream repositories.
- Maintain accessible contrast, keyboard operation, reduced-motion support, and responsive behavior.

## Non-Goals

- No documentation browser, account system, pricing, testimonials, or blog.
- No fake generation metrics or invented customer claims.
- No large terminal simulator in the hero.
- No repeated grid of feature cards.
- No nested cards or decorative glass panels that do not serve a workflow.
- No purple-blue AI aesthetic.

## Visual Direction

### Theme

The site uses off-black and near-black surfaces with restrained spectral mint as the primary accent and warm amber only where `gflow-skills` or generated output needs contrast.

The visual language is cinematic, spatial, and precise:

- Full-bleed moving media.
- Large, tightly composed typography.
- Thin structural lines rather than heavy frames.
- Open layouts with depth instead of floating dashboard cards.
- Portal geometry, refractive rings, particles, and light trails.
- Minimal UI chrome.

### Typography

- Display: a geometric grotesk with strong weight and compact proportions.
- Body: a clean sans-serif with relaxed line height.
- Commands: a dedicated monospace stack.
- No viewport-width font scaling.
- No negative letter spacing in CSS.

### Container Model

- Hero: full-viewport media stage with no containing card.
- Product chapter: one full-width split world.
- Skills chapter: open spatial rail or luminous current.
- Quality chapter: circular spatial gates.
- Final CTA: open centered composition.
- Small framed controls are allowed only for selectors, the command field, and copy action.

## Information Architecture

1. Portal Film hero
2. Product split: `gflow-cli` and `gflow-skills`
3. Twelve-skill flowing pipeline
4. Five quality gates
5. Final installation CTA and repository links

The fixed navigation contains:

- gflow brand
- Products
- Skills
- GitHub

## Hero

### Composition

The hero fills the first viewport. A muted, looping, eight-second portal film covers the full background. The film shows a continuous camera flight through dimensional rings, refractive geometry, particles, and stretched light.

The media must remain inspectable and crisp. It must not be obscured by a heavy color wash, blur, or large interface panel.

Centered over the film:

- Heading: `From prompt to world.`
- Package-manager selector
- Agent selector
- Combined installation command
- Copy command action
- One short supporting sentence

The heading and installer remain the only major foreground elements. Navigation sits at the top edge. A restrained timeline and `Scroll to enter` indicator sit near the bottom.

### Combined Installer

The installer configures both products:

1. Install `@swissmarley/gflow-cli` globally.
2. Run the `gflow-skills` installer for the selected coding agent.

Package-manager choices:

- npm
- pnpm
- yarn
- bun

Agent choices:

- Codex
- Claude
- Cursor
- Hermes
- OpenCode

Command templates:

```text
npm install -g @swissmarley/gflow-cli && npx gflow-skills install --agent <agent>
pnpm add -g @swissmarley/gflow-cli && npx gflow-skills install --agent <agent>
yarn global add @swissmarley/gflow-cli && npx gflow-skills install --agent <agent>
bun add -g @swissmarley/gflow-cli && npx gflow-skills install --agent <agent>
```

The selected package manager and agent update the displayed command immediately. The copy action writes the current command and visibly confirms success without shifting layout.

The package-manager selector controls the global CLI installation command. The skills installer intentionally uses its documented `npx` entry point for every package-manager choice.

The default state is npm plus Codex.

### Hero Motion

The video plays automatically when allowed:

- muted
- looping
- `playsinline`
- poster image supplied
- no native controls

Scroll choreography:

1. **Arrival:** the film loops with slow portal rotation and particles.
2. **Approach:** the foreground command remains legible while the media scale subtly increases.
3. **Threshold:** the heading and selectors separate in depth and fade using only transform and opacity.
4. **Entry:** the camera appears to pass through the portal into the product split.

Pointer movement may add subtle parallax to the foreground portal geometry on precise-pointer devices. It must not move the command field.

If reduced motion is requested:

- Use the poster frame instead of autoplay motion.
- Disable pointer parallax.
- Replace scrubbed camera movement with simple crossfades.

## Product Split

The first chapter after the portal is a full-width world divided into two visual environments.

### gflow-cli

- Mint-green spatial language.
- Product role: authenticated control layer for Google Flow.
- Key ideas: Chrome session, images, video, frames mode, batch pipelines, native downloads.
- One concise command example is allowed, integrated into the environment rather than placed in a terminal card.
- Link to the `gflow-cli` repository.

### gflow-skills

- Warm amber spatial language.
- Product role: twelve-skill creative production system for coding agents.
- Key ideas: foundation skills, ten production disciplines, agent installers, quality gate.
- Link to the `gflow-skills` repository.

Scroll moves the camera laterally through the split. The two environments must remain visually connected by the same portal geometry and lighting system.

## Skills Pipeline

The twelve skills appear along one luminous current rather than as twelve cards.

Skills:

1. Immersive Web
2. Cinema Production
3. Motion Graphics
4. Product Visuals
5. Brand Identity
6. Character Pipeline
7. Editorial Design
8. Architectural Visualization
9. Game Assets
10. Social Content
11. Design Documents
12. Music Video

As the user scrolls:

- The camera follows the current.
- Skill names activate in sequence.
- Icons remain restrained and secondary.
- The current changes shape and depth without causing horizontal page overflow.

On mobile, this becomes a vertical current with the same order.

## Quality Gates

Five circular gates replace the existing quality cards:

1. Brief
2. Generate
3. Review
4. Refine
5. Ship

Each gate activates when the camera passes through it. The accompanying copy explains that quality is structural across:

- visual fidelity
- technical accuracy
- accessibility
- brand continuity
- production-ready delivery

The interaction must avoid rapid flashing and must remain readable when motion is disabled.

## Final CTA

The final chapter returns to a calm, open composition.

Visible content:

- Heading: `Enter the creative flow.`
- The same package-manager and agent selectors.
- The same combined installer command and copy action.
- Links to both GitHub repositories.

Selector state is shared with the hero. A change in either location updates both command composers.

## 3D and Media Architecture

### Hero Media

The primary hero asset is a production MP4 loop with a WebM source when practical:

- `public/media/portal-film.mp4`
- `public/media/portal-film.webm`
- `public/media/portal-poster.webp`

The film should be generated specifically for gflow rather than sourced as generic stock footage. It should contain no embedded text or logos.

### Interactive 3D

Three.js remains responsible for interactive spatial chapters and light portal accents:

- Product split geometry.
- Skill current.
- Quality gates.
- Subtle hero foreground refraction when performance permits.

The video is the hero background. Three.js must not duplicate the entire video or create a competing canvas-heavy composition over it.

### Performance

- Lazy-load non-hero 3D chapters.
- Cap device pixel ratio.
- Pause animation outside visible chapters.
- Animate transform, opacity, and WebGL scene properties only.
- Avoid raw scroll listeners; use a normalized animation-frame scroll controller or an established scroll library.
- Use IntersectionObserver for chapter activation and media pausing.
- Supply static fallbacks for reduced motion and failed WebGL initialization.

## Components

The React implementation should separate:

- `PortalHero`
- `InstallComposer`
- `PackageManagerSelect`
- `AgentSelect`
- `ProductWorld`
- `SkillsCurrent`
- `QualityGates`
- `FinalInstall`
- `PortalScene`
- Shared installation command state

`App` remains composition glue. Three.js lifecycle and geometry should live outside the main page component.

## Accessibility

- WCAG AA text contrast.
- Minimum 44-by-44-pixel interactive targets.
- Keyboard-operable selectors and copy action.
- Visible focus states.
- Semantic headings and landmarks.
- Video marked decorative when it conveys no unique information.
- Poster and static text preserve all meaning when video is unavailable.
- `prefers-reduced-motion` disables autoplay-dependent storytelling.
- No information communicated by color alone.

## Responsive Behavior

### Desktop

- Full-bleed portal film.
- Centered command composer with selectors above it.
- Spatial horizontal movement in the product and skills chapters.

### Tablet

- Preserve full-bleed film and centered installer.
- Reduce 3D depth and particle count.
- Product split may stack when the viewport cannot support both environments.

### Mobile

- Hero remains full-height with the portal focal point positioned behind, not underneath, the installer.
- Heading and command must fit without horizontal scrolling.
- Selectors wrap into a stable two-control row or stack.
- Product environments stack vertically.
- Skills current becomes vertical.
- Quality gates become a vertical sequence.
- No horizontal document overflow.

## Error Handling

- If video autoplay fails, show the poster frame without an error message.
- If a source fails, fall through to the next video source and then the poster.
- If WebGL fails, render CSS and media fallbacks while retaining all content and controls.
- If clipboard access fails, select the command text and show a concise manual-copy state.

## Verification

### Functional

- Every package-manager and agent combination produces the correct command.
- Copy action copies the current command.
- Hero and final installer stay synchronized.
- Repository links point to the correct projects.
- Video fallback behavior works.
- Reduced-motion mode preserves all content and navigation.

### Visual

- Compare the implementation to the approved visual companion design.
- Verify desktop at 1440 by 1000.
- Verify mobile at 390 by 844.
- Inspect the first viewport, product split, skills current, quality gates, and final CTA.
- Confirm the portal remains the hero focal point.
- Confirm no oversized terminal dashboard or repeated glass-card grid remains.
- Confirm no text overlaps the installer or portal focal point.

### Performance

- Confirm the hero displays promptly with the poster before video readiness.
- Confirm the scroll experience remains responsive on a mid-range mobile viewport.
- Confirm offscreen Three.js work pauses.
- Confirm no relevant runtime console errors.

## Approved Design References

The approved visual companion screens are stored locally under:

```text
.superpowers/brainstorm/4328-1780733478/content/
```

Key approved screens:

- `video-hero-styles.html` with Portal Film selected.
- `full-page-structure.html` with Immersive Chapters selected.
- `final-design-review.html` with the complete redesign approved.
