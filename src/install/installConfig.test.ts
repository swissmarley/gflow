import { describe, expect, it } from "vitest";

import {
  AGENTS,
  AGENT_LABELS,
  DEFAULT_AGENT,
  DEFAULT_PACKAGE_MANAGER,
  getInstallCommand,
  PACKAGE_MANAGERS
} from "./installConfig";

const expectedAgents = ["codex", "claude", "cursor", "hermes", "opencode"] as const;
const expectedPackageManagers = ["npm", "pnpm", "yarn", "bun"] as const;

const commandPrefixes = {
  npm: "npm install -g @swissmarley/gflow-cli",
  pnpm: "pnpm add -g @swissmarley/gflow-cli",
  yarn: "yarn global add @swissmarley/gflow-cli",
  bun: "bun add -g @swissmarley/gflow-cli"
} as const;

const installCases = expectedPackageManagers.flatMap((packageManager) => {
  const commandPrefix = commandPrefixes[packageManager];

  return (
    expectedAgents.map((agent) => ({
      packageManager,
      agent,
      expected: `${commandPrefix} && npx gflow-skills install --agent ${agent}`
    }))
  );
});

describe("installConfig", () => {
  it("keeps stable lowercase agent identifiers", () => {
    expect(AGENTS).toEqual(expectedAgents);
    expect(AGENTS).toHaveLength(5);
    expect(AGENTS.every((agent) => agent === agent.toLowerCase())).toBe(true);
  });

  it("exposes supported package managers, defaults, and agent labels", () => {
    expect(PACKAGE_MANAGERS).toEqual(expectedPackageManagers);
    expect(DEFAULT_PACKAGE_MANAGER).toBe("npm");
    expect(DEFAULT_AGENT).toBe("codex");
    expect(AGENT_LABELS).toEqual({
      codex: "Codex",
      claude: "Claude",
      cursor: "Cursor",
      hermes: "Hermes",
      opencode: "OpenCode"
    });
  });

  it("covers every package-manager and agent combination", () => {
    expect(installCases).toHaveLength(20);
    expect(
      new Set(installCases.map(({ packageManager, agent }) => `${packageManager}:${agent}`))
        .size
    ).toBe(20);
  });

  it.each(installCases)(
    "builds the $packageManager command for $agent",
    ({ packageManager, agent, expected }) => {
      expect(getInstallCommand(packageManager, agent)).toBe(expected);
    }
  );
});
