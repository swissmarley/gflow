import {
  AGENTS,
  AGENT_LABELS,
  type Agent
} from "../../install/installConfig";
import { useInstallConfig } from "../../install/InstallContext";

export function AgentSelect() {
  const { agent, setAgent } = useInstallConfig();

  return (
    <label className="agent-select">
      <span>Coding agent</span>
      <select
        aria-label="Coding agent"
        onChange={(event) => setAgent(event.target.value as Agent)}
        value={agent}
      >
        {AGENTS.map((value) => (
          <option key={value} value={value}>
            {AGENT_LABELS[value]}
          </option>
        ))}
      </select>
    </label>
  );
}
