import { describe, it, beforeEach, expect, vi } from "vitest";
import { detectPackageManager, getVersionPrefix } from "./package-manager.js";
import { access } from "node:fs/promises";
import { readPackageFile } from "./package-metadata.js";
import { runCommand } from "./run-command.js";

vi.mock(import("node:fs/promises"), () => ({
  access: vi.fn(),
}));

vi.mock(import("node:path"), async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    join: originalModule.posix.join,
  };
});

vi.mock(import("./package-metadata.js"), () => ({
  readPackageFile: vi.fn(),
}));

vi.mock(import("./run-command.js"), () => ({
  runCommand: vi.fn(),
}));

describe("detectPackageManager", () => {
  beforeEach(() => {
    vi.mocked(readPackageFile).mockReset().mockResolvedValue({ version: "1.0.0" });
    vi.mocked(access).mockReset().mockRejectedValue(new Error("File does not exist"));
  });

  it("defaults to npm", async () => {
    expect(await detectPackageManager("cwd")).toBe("npm");
  });

  it("uses packageManager from package file", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(readPackageFile).mockResolvedValue({ version: "1.0.0", packageManager: "yarn" });

    expect(await detectPackageManager("cwd")).toBe("yarn");

    vi.mocked(readPackageFile).mockResolvedValue({ version: "1.0.0", packageManager: "pnpm" });

    expect(await detectPackageManager("cwd")).toBe("pnpm");

    expect(warn).not.toHaveBeenCalled();
  });

  it("ignores unknown package managers", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    vi.mocked(readPackageFile).mockResolvedValue({ version: "1.0.0", packageManager: "unknown" });

    expect(await detectPackageManager("cwd")).toBe("npm");

    expect(warn).toHaveBeenCalledExactlyOnceWith('Unknown package manager: "unknown"');
  });

  it("implies pnpm from pnpm lock file", async () => {
    vi.mocked(access).mockImplementation(async (path) => {
      if (path !== "cwd/pnpm-lock.yaml") {
        throw new Error("File does not exist");
      }
    });

    expect(await detectPackageManager("cwd")).toBe("pnpm");
    expect(vi.mocked(access)).toHaveBeenCalledWith("cwd/pnpm-lock.yaml");
  });

  it("implies yarn from yarn lock file", async () => {
    vi.mocked(access).mockImplementation(async (path) => {
      if (path !== "cwd/yarn.lock") {
        throw new Error("File does not exist");
      }
    });

    expect(await detectPackageManager("cwd")).toBe("yarn");
    expect(vi.mocked(access)).toHaveBeenCalledWith("cwd/yarn.lock");
  });
});

describe("getVersionPrefix", () => {
  beforeEach(() => {
    vi.mocked(runCommand).mockReset();
  });

  it("passes through the output of npm config get tag-version-prefix", () => {
    vi.mocked(runCommand).mockReturnValue("version-");
    expect(getVersionPrefix("npm", "cwd")).toBe("version-");
    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("npm config get tag-version-prefix", "cwd");
  });

  it("passes through the output of yarn config get version-tag-prefix", () => {
    vi.mocked(runCommand).mockReturnValue("version-");
    expect(getVersionPrefix("yarn", "cwd")).toBe("version-");
    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("yarn config get version-tag-prefix", "cwd");
  });

  it("passes through the output of pnpm config get tag-version-prefix", () => {
    vi.mocked(runCommand).mockReturnValue("version-");
    expect(getVersionPrefix("pnpm", "cwd")).toBe("version-");
    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("pnpm config get tag-version-prefix", "cwd");
  });

  it("returns v if the command output is empty", () => {
    vi.mocked(runCommand).mockReturnValue("");
    expect(getVersionPrefix("npm", "cwd")).toBe("v");
    expect(getVersionPrefix("yarn", "cwd")).toBe("v");
    expect(getVersionPrefix("pnpm", "cwd")).toBe("v");
  });

  it("returns v if the command output is undefined", () => {
    vi.mocked(runCommand).mockReturnValue("undefined");
    expect(getVersionPrefix("npm", "cwd")).toBe("v");
    expect(getVersionPrefix("yarn", "cwd")).toBe("v");
    expect(getVersionPrefix("pnpm", "cwd")).toBe("v");
  });
});
