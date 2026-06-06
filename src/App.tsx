import {
  ArrowUpRight,
  Building2,
  Check,
  Clapperboard,
  Copy,
  Cpu,
  FileText,
  Film,
  Gamepad2,
  Github,
  Image as ImageIcon,
  Music2,
  PackageCheck,
  Paintbrush,
  PenTool,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Terminal,
  Workflow
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Product = {
  accent: "mint" | "amber";
  title: string;
  subtitle: string;
  copy: string;
  commands: string[];
  points: string[];
  href: string;
};

type InstallKey = "npm" | "pnpm" | "yarn" | "bun";

const products: Product[] = [
  {
    accent: "mint",
    title: "gflow-cli",
    subtitle: "Terminal interface for Google Flow",
    copy:
      "Drive image and video generation through your own signed-in Chrome session, then download Flow's native assets from repeatable commands.",
    commands: [
      "npm install -g @swissmarley/gflow-cli",
      "gflow auth login",
      "gflow doctor",
      'gflow image --id hero --prompt "editorial product still"',
      'gflow video --id reveal --duration 8 --out ./out'
    ],
    points: [
      "Signed-in Chrome handoff",
      "Images, video, frames mode",
      "YAML batch pipelines",
      "Characters, tools, agent prompts"
    ],
    href: "https://github.com/swissmarley/gflow-cli"
  },
  {
    accent: "amber",
    title: "gflow-skills",
    subtitle: "12-skill creative production pipeline",
    copy:
      "Install agent-ready production skills that turn Flow into a repeatable studio system for cinematic websites, film, motion, product work, and brand continuity.",
    commands: [
      "npx gflow-skills install --agent codex",
      "npx gflow-skills list",
      "/brand",
      "/immersive --project gflow",
      "node lib/registry.js --validate"
    ],
    points: [
      "Foundation brand and character skills",
      "Ten production disciplines",
      "Native agent installers",
      "Built-in quality gate"
    ],
    href: "https://github.com/swissmarley/gflow-skills"
  }
];

const skills = [
  { label: "Immersive Web", icon: Workflow },
  { label: "Cinema", icon: Film },
  { label: "Motion", icon: Clapperboard },
  { label: "Product Visuals", icon: ImageIcon },
  { label: "Brand Identity", icon: Paintbrush },
  { label: "Character Pipeline", icon: Sparkles },
  { label: "Editorial Design", icon: PenTool },
  { label: "Architecture", icon: Building2 },
  { label: "Game Assets", icon: Gamepad2 },
  { label: "Social Content", icon: Smartphone },
  { label: "Design Docs", icon: FileText },
  { label: "Music Video", icon: Music2 }
];

const gates = [
  {
    title: "Brief and Spec",
    state: "PASS",
    copy: "Audience, constraints, and success criteria are locked before generation."
  },
  {
    title: "Generate",
    state: "PASS",
    copy: "Prompts, model settings, and asset output are versioned as production inputs."
  },
  {
    title: "Review",
    state: "REVIEW",
    copy: "Visual fidelity, technical accuracy, and brand continuity get inspected."
  },
  {
    title: "Refine",
    state: "PASS",
    copy: "Only focused iterations move forward, with visible issues resolved."
  },
  {
    title: "Deliver",
    state: "PASS",
    copy: "Final output ships with documentation, assets, and handoff clarity."
  }
];

const installCommands: Record<InstallKey, string> = {
  npm: "npm install -g @swissmarley/gflow-cli",
  pnpm: "pnpm add -g @swissmarley/gflow-cli",
  yarn: "yarn global add @swissmarley/gflow-cli",
  bun: "bun add -g @swissmarley/gflow-cli"
};

function useReveals() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px" }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
}

function createFrame(width: number, height: number, z: number, color: number, opacity: number) {
  const hw = width / 2;
  const hh = height / 2;
  const positions = new Float32Array([
    -hw,
    -hh,
    z,
    hw,
    -hh,
    z,
    hw,
    -hh,
    z,
    hw,
    hh,
    z,
    hw,
    hh,
    z,
    -hw,
    hh,
    z,
    -hw,
    hh,
    z,
    -hw,
    -hh,
    z
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  return new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
}

function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020604, 0.018);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 180);
    camera.position.set(0, 0.8, 9);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.AmbientLight(0x8fffd0, 0.08);
    scene.add(ambient);

    const mintLight = new THREE.PointLight(0x5fffc1, 6.5, 30);
    mintLight.position.set(-3, 2.4, 4);
    scene.add(mintLight);

    const amberLight = new THREE.PointLight(0xffa634, 5.8, 34);
    amberLight.position.set(4, -1.2, -8);
    scene.add(amberLight);

    const frames: THREE.LineSegments[] = [];
    for (let index = 0; index < 46; index += 1) {
      const color = index % 5 === 0 ? 0xffa83a : 0x4dffba;
      const frame = createFrame(8.4 + index * 0.025, 4.7 + index * 0.016, -index * 3.25, color, 0.12);
      frame.rotation.z = (index % 6) * 0.018;
      frame.position.x = Math.sin(index * 0.58) * 0.55;
      frame.position.y = Math.cos(index * 0.41) * 0.26;
      root.add(frame);
      frames.push(frame);
    }

    const paneGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const panes: THREE.Mesh[] = [];
    for (let index = 0; index < 22; index += 1) {
      const isAmber = index % 4 === 0;
      const material = new THREE.MeshPhysicalMaterial({
        color: isAmber ? 0x3a220a : 0x08241c,
        emissive: isAmber ? 0x5e3000 : 0x003b2a,
        emissiveIntensity: 0.14,
        transparent: true,
        opacity: 0.16,
        roughness: 0.24,
        metalness: 0.26,
        transmission: 0.42,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const pane = new THREE.Mesh(paneGeometry, material);
      const side = index % 2 === 0 ? -1 : 1;
      pane.position.set(side * (3.2 + (index % 3) * 0.5), (index % 5) * 0.42 - 0.8, -7 - index * 5.6);
      pane.scale.set(1.7 + (index % 4) * 0.5, 0.82 + (index % 3) * 0.32, 1);
      pane.rotation.set(0.08 * side, side * 0.64, 0.08 * side);
      root.add(pane);
      panes.push(pane);
    }

    const pointsCount = 900;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);
    for (let index = 0; index < pointsCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 13;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[index * 3 + 2] = -Math.random() * 150;
      const amber = Math.random() > 0.78;
      colors[index * 3] = amber ? 1 : 0.32;
      colors[index * 3 + 1] = amber ? 0.52 : 1;
      colors[index * 3 + 2] = amber ? 0.15 : 0.72;
    }
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(
      pointsGeometry,
      new THREE.PointsMaterial({
        size: 0.017,
        vertexColors: true,
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    root.add(points);

    const core = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.82, 0.16, 160, 18),
      new THREE.MeshStandardMaterial({
        color: 0x111a15,
        emissive: 0xffa12b,
        emissiveIntensity: 0.62,
        metalness: 0.82,
        roughness: 0.18
      })
    );
    core.position.set(2.7, -1.25, -16);
    root.add(core);

    const clock = new THREE.Clock();
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mediaQuery.matches;
    let smoothProgress = 0;
    let frameId = 0;

    const updateMotionPreference = () => {
      reducedMotion = mediaQuery.matches;
    };

    mediaQuery.addEventListener("change", updateMotionPreference);

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", resize);

    const render = () => {
      const elapsed = clock.getElapsedTime();
      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const targetProgress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
      const damping = reducedMotion ? 0.18 : 0.055;

      smoothProgress += (targetProgress - smoothProgress) * damping;
      camera.position.z = 9 - smoothProgress * 126;
      camera.position.x = Math.sin(smoothProgress * Math.PI * 2.2) * 1.05;
      camera.position.y = 0.72 + Math.cos(smoothProgress * Math.PI * 1.55) * 0.32;
      camera.rotation.z = reducedMotion ? 0 : Math.sin(smoothProgress * 4.8) * 0.028;
      camera.lookAt(Math.sin(smoothProgress * 4.5) * 0.42, 0.06, camera.position.z - 16);

      const timeFactor = reducedMotion ? 0 : elapsed;
      root.rotation.z = Math.sin(timeFactor * 0.16 + smoothProgress * 2.4) * 0.038;
      root.rotation.y = Math.sin(smoothProgress * 3.3) * 0.055;
      core.rotation.x = timeFactor * 0.34 + smoothProgress * 4.2;
      core.rotation.y = timeFactor * 0.48 + smoothProgress * 2.1;

      frames.forEach((frame, index) => {
        const material = frame.material as THREE.LineBasicMaterial;
        const pulse = 0.08 + Math.max(0, Math.sin(smoothProgress * 16 - index * 0.28)) * 0.18;
        material.opacity = index % 7 === 0 ? pulse + 0.08 : pulse;
      });

      panes.forEach((pane, index) => {
        pane.position.y += Math.sin(timeFactor * 0.5 + index) * 0.0008;
      });

      points.rotation.z = timeFactor * 0.012;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      mediaQuery.removeEventListener("change", updateMotionPreference);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      paneGeometry.dispose();
      pointsGeometry.dispose();
      frames.forEach((frame) => {
        frame.geometry.dispose();
        (frame.material as THREE.Material).dispose();
      });
      panes.forEach((pane) => (pane.material as THREE.Material).dispose());
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="scene-canvas" aria-hidden="true" />;
}

function CommandLine({ children }: { children: string }) {
  return (
    <p className="command-line">
      <span>$</span> {children}
    </p>
  );
}

function ProductPanel({ product, index }: { product: Product; index: number }) {
  return (
    <article className={`product-panel product-panel--${product.accent}`} data-reveal>
      <div className="product-copy">
        <div className="product-icon" aria-hidden="true">
          {product.accent === "mint" ? <Terminal size={24} /> : <Workflow size={24} />}
        </div>
        <span className="product-index">0{index + 1}</span>
        <h3>{product.title}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        <p>{product.copy}</p>
        <ul>
          {product.points.map((point) => (
            <li key={point}>
              <Check size={16} aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <a href={product.href} target="_blank" rel="noreferrer" className="text-link">
          View repo <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="terminal-card" aria-label={`${product.title} command preview`}>
        <div className="window-controls" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="terminal-card__body">
          {product.commands.map((command) => (
            <CommandLine key={command}>{command}</CommandLine>
          ))}
        </div>
      </div>
    </article>
  );
}

function SkillRail() {
  return (
    <div className="skill-rail" data-reveal>
      <div className="rail-header">
        <span>01</span>
        <span>12</span>
      </div>
      <div className="rail-line" aria-hidden="true" />
      <div className="skill-grid">
        {skills.map(({ label, icon: Icon }, index) => (
          <div className="skill-node" key={label}>
            <span className="skill-number">{String(index + 1).padStart(2, "0")}</span>
            <Icon size={24} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstallTerminal() {
  const [active, setActive] = useState<InstallKey>("npm");
  const [copied, setCopied] = useState(false);
  const command = installCommands[active];

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="install-terminal" data-reveal>
      <div className="install-terminal__top">
        <span>Install gflow</span>
        <button className="icon-button" type="button" onClick={copyCommand} aria-label="Copy install command">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
      <div className="tabs" role="tablist" aria-label="Package manager">
        {(Object.keys(installCommands) as InstallKey[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={active === key}
            className={active === key ? "is-active" : ""}
            type="button"
            onClick={() => setActive(key)}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="install-terminal__body">
        <CommandLine>{command}</CommandLine>
        <p className="terminal-muted">added creative automation to the current shell</p>
        <CommandLine>gflow auth login</CommandLine>
        <p className="terminal-success">Connected to Chrome profile: default</p>
        <CommandLine>gflow doctor</CommandLine>
        <p className="terminal-success">Flow session ready</p>
        <CommandLine>npx gflow-skills install --agent codex</CommandLine>
        <p className="terminal-success">12 skills available</p>
        <p className="terminal-caret">$</p>
      </div>
    </div>
  );
}

function App() {
  useReveals();

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <>
      <ThreeScene />
      <div className="grain" aria-hidden="true" />
      <header className="site-header">
        <a href="#home" className="brand" aria-label="gflow home">
          <span className="brand-mark" aria-hidden="true" />
          <span>gflow</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#products">Products</a>
          <a href="#pipeline">Pipeline</a>
          <a href="#quality">Quality</a>
          <a href="#install">Install</a>
        </nav>
        <a href="https://github.com/swissmarley" target="_blank" rel="noreferrer" className="header-action">
          GitHub <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </header>

      <main id="home">
        <section className="section hero-section" aria-labelledby="hero-title">
          <div className="hero-copy" data-reveal>
            <h1 id="hero-title">gflow</h1>
            <p className="hero-lede">Create at terminal speed.</p>
            <p className="hero-body">
              Two developer tools. One creative engine. Drive Google Flow from your terminal, then scale the
              same design DNA through production-ready agent skills.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a href="#products" className="button button--primary">
                <Terminal size={18} aria-hidden="true" />
                Explore products
              </a>
              <a href="#install" className="button button--secondary">
                <Play size={18} aria-hidden="true" />
                Start creating
              </a>
            </div>
            <button className="command-chip" type="button" onClick={() => navigator.clipboard?.writeText("npm install -g @swissmarley/gflow-cli")}>
              <span>$ npm install -g @swissmarley/gflow-cli</span>
              <Copy size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="hero-console" data-reveal>
            <div className="console-window">
              <div className="console-title">
                <span>gflow</span>
                <span>live session</span>
              </div>
              <div className="console-grid">
                <div className="console-code">
                  <CommandLine>gflow auth login</CommandLine>
                  <p className="terminal-success">Connected to Chrome</p>
                  <CommandLine>gflow image --id canyon --model imagen-4</CommandLine>
                  <p className="terminal-muted">Generating image...</p>
                  <p className="terminal-success">Native asset downloaded</p>
                  <CommandLine>gflow video --id flythrough --duration 8</CommandLine>
                  <p className="terminal-muted">Rendering Flow clip...</p>
                  <p className="terminal-success">Video created</p>
                </div>
                <div className="preview-stack">
                  <div className="preview-tile preview-tile--image">
                    <span>IMAGE</span>
                  </div>
                  <div className="preview-tile preview-tile--video">
                    <span>VIDEO</span>
                    <Play size={26} aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="progress-track" aria-label="Generation progress">
                <span />
              </div>
            </div>
            <div className="proof-strip" aria-label="Product promise">
              <span>Powered by Google Flow</span>
              <span>Driven by you</span>
              <span>Quality-gated by design</span>
            </div>
          </div>
        </section>

        <section className="section product-section" id="products" aria-labelledby="products-title">
          <div className="section-kicker">
            <span>Products</span>
            <h2 id="products-title">Two tools. Infinite output.</h2>
            <p>
              Use the command layer when you need direct control. Add skills when you want repeatable studio
              workflows for coding agents and production teams.
            </p>
          </div>
          <div className="product-stack">
            {products.map((product, index) => (
              <ProductPanel key={product.title} product={product} index={index} />
            ))}
          </div>
        </section>

        <section className="section pipeline-section" id="pipeline" aria-labelledby="pipeline-title">
          <div className="section-kicker" data-reveal>
            <span>Pipeline</span>
            <h2 id="pipeline-title">12 skills. One production spine.</h2>
            <p>
              Foundation skills establish characters and brand systems. Production skills inherit that context,
              then ship focused assets with the same visual rules.
            </p>
          </div>
          <SkillRail />
        </section>

        <section className="section quality-section" id="quality" aria-labelledby="quality-title">
          <div className="section-kicker" data-reveal>
            <span>Quality Gates</span>
            <h2 id="quality-title">Built-in quality. Shippable results.</h2>
            <p>
              gflow-skills uses explicit standards for anti-generic design, accessibility, motivated motion,
              and final review before work leaves the pipeline.
            </p>
          </div>
          <div className="gate-grid">
            {gates.map((gate, index) => (
              <article className={`gate-card gate-card--${gate.state.toLowerCase()}`} key={gate.title} data-reveal>
                <span className="gate-number">Gate {String(index + 1).padStart(2, "0")}</span>
                <ShieldCheck size={24} aria-hidden="true" />
                <h3>{gate.title}</h3>
                <p>{gate.copy}</p>
                <strong>{gate.state}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="section forge-section" aria-labelledby="forge-title">
          <div className="forge-copy" data-reveal>
            <h2 id="forge-title">From one prompt to a production system.</h2>
            <p>
              gflow-cli creates the authenticated bridge to Flow. gflow-skills turns that bridge into reusable
              creative practice, from brand setup to immersive web builds and final documentation.
            </p>
          </div>
          <div className="flow-map" data-reveal aria-label="gflow product relationship">
            <div>
              <Terminal size={28} aria-hidden="true" />
              <span>gflow-cli</span>
              <small>Chrome session, Flow UI, native downloads</small>
            </div>
            <div className="flow-map__beam" aria-hidden="true" />
            <div>
              <Cpu size={28} aria-hidden="true" />
              <span>gflow-skills</span>
              <small>Agent workflows, quality gates, production output</small>
            </div>
            <div className="flow-map__beam flow-map__beam--amber" aria-hidden="true" />
            <div>
              <PackageCheck size={28} aria-hidden="true" />
              <span>Delivery</span>
              <small>Images, videos, decks, sites, systems</small>
            </div>
          </div>
        </section>

        <section className="section install-section" id="install" aria-labelledby="install-title">
          <div className="section-kicker install-copy" data-reveal>
            <span>Get Started</span>
            <h2 id="install-title">Install. Login. Start creating.</h2>
            <p>
              Use the CLI first, confirm your Flow session, then add the skills package for agent-ready creative
              production.
            </p>
            <div className="hero-actions">
              <a href="https://github.com/swissmarley/gflow-cli" target="_blank" rel="noreferrer" className="button button--primary">
                <Github size={18} aria-hidden="true" />
                gflow-cli
              </a>
              <a href="https://github.com/swissmarley/gflow-skills" target="_blank" rel="noreferrer" className="button button--secondary">
                <Sparkles size={18} aria-hidden="true" />
                gflow-skills
              </a>
            </div>
          </div>
          <InstallTerminal />
        </section>
      </main>

      <footer className="site-footer">
        <a href="#home" className="brand" aria-label="gflow home">
          <span className="brand-mark" aria-hidden="true" />
          <span>gflow</span>
        </a>
        <span>Developer tools for creative builders.</span>
        <span>{year} gflow. MIT projects by swissmarley.</span>
      </footer>
    </>
  );
}

export default App;
