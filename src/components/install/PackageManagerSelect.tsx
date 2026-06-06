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
        <label
          className={packageManager === manager ? "is-active" : ""}
          key={manager}
        >
          <input
            checked={packageManager === manager}
            name={groupName}
            onChange={() => setPackageManager(manager)}
            type="radio"
            value={manager}
          />
          <span>{manager}</span>
        </label>
      ))}
    </fieldset>
  );
}
