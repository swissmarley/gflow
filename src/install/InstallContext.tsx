import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

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
  const [packageManager, setPackageManager] = useState<PackageManager>(
    DEFAULT_PACKAGE_MANAGER
  );
  const [agent, setAgent] = useState<Agent>(DEFAULT_AGENT);
  const command = useMemo(
    () => getInstallCommand(packageManager, agent),
    [agent, packageManager]
  );

  return (
    <InstallContext.Provider
      value={{ packageManager, setPackageManager, agent, setAgent, command }}
    >
      {children}
    </InstallContext.Provider>
  );
}

export function useInstallConfig() {
  const value = useContext(InstallContext);

  if (!value) {
    throw new Error("useInstallConfig must be used inside InstallProvider");
  }

  return value;
}
