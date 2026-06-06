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

const INSTALL_COMMANDS: Record<PackageManager, string> = {
  npm: "npm install -g @swissmarley/gflow-cli",
  pnpm: "pnpm add -g @swissmarley/gflow-cli",
  yarn: "yarn global add @swissmarley/gflow-cli",
  bun: "bun add -g @swissmarley/gflow-cli"
};

export function getInstallCommand(
  packageManager: PackageManager,
  agent: Agent
): string {
  return `${INSTALL_COMMANDS[packageManager]} && npx gflow-skills install --agent ${agent}`;
}
