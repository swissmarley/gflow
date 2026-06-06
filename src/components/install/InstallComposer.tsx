import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useInstallConfig } from "../../install/InstallContext";
import { AgentSelect } from "./AgentSelect";
import { PackageManagerSelect } from "./PackageManagerSelect";

type CopyState = "idle" | "copied" | "manual";

const COPY_LABELS: Record<CopyState, string> = {
  idle: "Copy install command",
  copied: "Install command copied",
  manual: "Command selected for manual copy"
};

export function InstallComposer({
  label,
  showPackageManager = true
}: {
  label: string;
  showPackageManager?: boolean;
}) {
  const { command } = useInstallConfig();
  const commandRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
    },
    []
  );

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

  return (
    <div aria-label={label} className="install-composer">
      <div className="install-controls">
        {showPackageManager && <PackageManagerSelect />}
        <AgentSelect />
      </div>
      <div className="command-field">
        <code data-testid="install-command" ref={commandRef}>
          {command}
        </code>
        <button
          aria-label={COPY_LABELS[copyState]}
          onClick={copyCommand}
          type="button"
        >
          {copyState === "copied" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span>Copy</span>
        </button>
      </div>
      <p aria-live="polite" className="copy-status" role="status">
        {copyState === "manual"
          ? "Clipboard unavailable. Press Command-C or Control-C."
          : ""}
      </p>
    </div>
  );
}
