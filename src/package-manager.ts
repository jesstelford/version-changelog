import { access } from "node:fs/promises";
import { join } from "node:path";
import { runCommand } from "./run-command.js";
import { readPackageFile } from "./package-metadata.js";

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
  const { packageManager } = await readPackageFile(cwd);
  if (packageManager !== undefined) {
    if (isPackageManager(packageManager)) {
      return packageManager;
    } else {
      console.warn(`Unknown package manager: ${JSON.stringify(packageManager)}`);
    }
  }

  if (await exists(join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (await exists(join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
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
