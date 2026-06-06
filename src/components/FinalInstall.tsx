import { ArrowUpRight } from "lucide-react";
import { InstallComposer } from "./install/InstallComposer";

export function FinalInstall() {
  return (
    <section className="final-install" id="install" aria-labelledby="install-title">
      <div className="final-ring" aria-hidden="true" />
      <div className="final-install__content">
        <h2 id="install-title">Enter the creative flow.</h2>
        <p className="final-lede">
          Install authenticated Flow control and the complete agent skill system
          with one synchronized command.
        </p>
        <InstallComposer label="Final installer" />
        <div className="repo-links">
          <a
            href="https://github.com/swissmarley/gflow-cli"
            target="_blank"
            rel="noreferrer"
          >
            gflow-cli <ArrowUpRight aria-hidden="true" />
          </a>
          <a
            href="https://github.com/swissmarley/gflow-skills"
            target="_blank"
            rel="noreferrer"
          >
            gflow-skills <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
