import {
  act,
  fireEvent,
  render,
  screen,
  within
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InstallProvider,
  useInstallConfig
} from "../../install/InstallContext";
import { InstallComposer } from "./InstallComposer";

const DEFAULT_COMMAND =
  "npm install -g @swissmarley/gflow-cli && npx gflow-skills install --agent codex";

function renderPair() {
  return render(
    <InstallProvider>
      <InstallComposer label="Hero installer" />
      <InstallComposer label="Final installer" />
    </InstallProvider>
  );
}

function getComposer(label: string) {
  return within(screen.getByLabelText(label));
}

function setClipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText }
  });

  return writeText;
}

describe("InstallComposer", () => {
  beforeEach(() => {
    setClipboard();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("shows the npm and Codex combined command by default", () => {
    renderPair();

    expect(screen.getAllByTestId("install-command")).toHaveLength(2);
    for (const command of screen.getAllByTestId("install-command")) {
      expect(command).toHaveTextContent(DEFAULT_COMMAND);
    }
  });

  it("synchronizes package manager changes across both composers", async () => {
    const user = userEvent.setup();
    renderPair();

    await user.click(
      getComposer("Hero installer").getByRole("radio", { name: "pnpm" })
    );

    for (const command of screen.getAllByTestId("install-command")) {
      expect(command).toHaveTextContent(
        "pnpm add -g @swissmarley/gflow-cli && npx gflow-skills install --agent codex"
      );
    }
  });

  it("synchronizes agent changes across both composers", async () => {
    const user = userEvent.setup();
    renderPair();

    await user.selectOptions(
      getComposer("Final installer").getByRole("combobox", {
        name: "Coding agent"
      }),
      "cursor"
    );

    for (const command of screen.getAllByTestId("install-command")) {
      expect(command).toHaveTextContent(
        "npm install -g @swissmarley/gflow-cli && npx gflow-skills install --agent cursor"
      );
    }
  });

  it("uses a separate radio group in each composer", async () => {
    const user = userEvent.setup();
    renderPair();

    const heroPnpm = getComposer("Hero installer").getByRole("radio", {
      name: "pnpm"
    });
    const finalPnpm = getComposer("Final installer").getByRole("radio", {
      name: "pnpm"
    });

    expect(heroPnpm).not.toHaveAttribute("name", finalPnpm.getAttribute("name"));

    await user.click(heroPnpm);

    expect(heroPnpm).toBeChecked();
    expect(finalPnpm).toBeChecked();
  });

  it("copies the current command and keeps a stable visible action label", async () => {
    const user = userEvent.setup();
    const writeText = setClipboard();
    renderPair();

    await user.click(
      getComposer("Hero installer").getByRole("radio", { name: "yarn" })
    );
    await user.selectOptions(
      getComposer("Final installer").getByRole("combobox", {
        name: "Coding agent"
      }),
      "hermes"
    );

    const copyButton = getComposer("Hero installer").getByRole("button", {
      name: "Copy install command"
    });
    expect(copyButton).toHaveTextContent("Copy");

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(
      "yarn global add @swissmarley/gflow-cli && npx gflow-skills install --agent hermes"
    );
    expect(
      getComposer("Hero installer").getByRole("button", {
        name: "Install command copied"
      })
    ).toHaveTextContent("Copy");
  });

  it("resets copied feedback after about 1800 milliseconds", async () => {
    vi.useFakeTimers();
    setClipboard();
    renderPair();

    await act(async () => {
      fireEvent.click(
        getComposer("Hero installer").getByRole("button", {
          name: "Copy install command"
        })
      );
      await Promise.resolve();
    });

    expect(
      getComposer("Hero installer").getByRole("button", {
        name: "Install command copied"
      })
    ).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1799));
    expect(
      getComposer("Hero installer").getByRole("button", {
        name: "Install command copied"
      })
    ).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1));
    expect(
      getComposer("Hero installer").getByRole("button", {
        name: "Copy install command"
      })
    ).toBeInTheDocument();
  });

  it("clears pending copied feedback when unmounted", async () => {
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const user = userEvent.setup();
    setClipboard();
    const { unmount } = renderPair();

    await user.click(
      getComposer("Hero installer").getByRole("button", {
        name: "Copy install command"
      })
    );
    const clearCallsBeforeUnmount = clearTimeoutSpy.mock.calls.length;

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledTimes(clearCallsBeforeUnmount + 2);
  });

  it("selects and announces the command when clipboard access fails", async () => {
    const user = userEvent.setup();
    setClipboard(
      vi.fn().mockRejectedValueOnce(new Error("Clipboard unavailable"))
    );
    renderPair();

    await user.click(
      getComposer("Final installer").getByRole("button", {
        name: "Copy install command"
      })
    );

    expect(window.getSelection()?.toString()).toBe(DEFAULT_COMMAND);
    expect(
      getComposer("Final installer").getByRole("button", {
        name: "Command selected for manual copy"
      })
    ).toHaveTextContent("Copy");
    expect(getComposer("Final installer").getByRole("status")).toHaveTextContent(
      "Clipboard unavailable. Press Command-C or Control-C."
    );
  });

  it("throws a clear error when the install hook is used outside its provider", () => {
    function InstallConfigProbe() {
      useInstallConfig();
      return null;
    }

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const preventWindowError = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", preventWindowError);

    try {
      expect(() => render(<InstallConfigProbe />)).toThrow(
        "useInstallConfig must be used inside InstallProvider"
      );
    } finally {
      window.removeEventListener("error", preventWindowError);
    }
  });
});
