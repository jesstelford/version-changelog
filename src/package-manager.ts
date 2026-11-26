import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { runCommand } from "./run-command.js";

const PACKAGE_MANAGERS = ["npm", "yarn", "pnpm"] as const;

type PackageManager = (typeof PACKAGE_MANAGERS)[number];

/** Checks if the given string is a valid package manager */
export function isPackageManager(packageManager: string): packageManager is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(packageManager);
}

/**
 * Checks if a file exists
 * @param path - The path to the file
 * @returns True if the file exists, false otherwise
 */
async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detects which package manager is being used
 * @param cwd - The directory to check for the package manager
 */
export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  const packageJson = JSON.parse(await readFile(join(cwd, "package.json"), "utf-8"));
  const packageManager = getPackageManagerFromPackageJson(packageJson);
  if (packageManager != null) {
    return packageManager;
  }

  if (await exists(join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await exists(join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

/** Gets the name of the package manager from package.json */
function getPackageManagerFromPackageJson(packageJson: Record<string, unknown>): PackageManager | null {
  if ("packageManager" in packageJson && typeof packageJson.packageManager === "string") {
    const packageManager = packageJson.packageManager.split("@")[0];
    if (isPackageManager(packageManager)) {
      return packageManager;
    } else {
      console.warn(`Unknown package manager: ${packageManager}`);
    }
  }
  if (
    "devEngines" in packageJson &&
    typeof packageJson.devEngines === "object" &&
    packageJson.devEngines != null &&
    "packageManager" in packageJson.devEngines &&
    typeof packageJson.devEngines.packageManager === "object" &&
    packageJson.devEngines.packageManager != null &&
    "name" in packageJson.devEngines.packageManager &&
    typeof packageJson.devEngines.packageManager.name === "string"
  ) {
    const packageManager = packageJson.devEngines.packageManager.name;
    if (isPackageManager(packageManager)) {
      return packageManager;
    } else {
      console.warn(`Unknown package manager: ${packageManager}`);
    }
  }
  return null;
}

const VERSION_PREFIX_COMMANDS = {
  npm: "npm config get tag-version-prefix",
  yarn: "yarn config get version-tag-prefix",
  pnpm: "pnpm config get tag-version-prefix",
} as const satisfies { [key in PackageManager]: string };

/** Gets the version prefix configured for a given package manger */
export function getVersionPrefix(packageManager: PackageManager, cwd: string): string {
  const output = runCommand(VERSION_PREFIX_COMMANDS[packageManager], cwd);
  if (output === "" || output === String(undefined)) {
    return "v";
  }
  return output;
}
