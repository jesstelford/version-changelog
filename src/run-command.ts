import { execSync } from "node:child_process";

/**
 * Run a shell command synchronously and return the result
 * @param command The shell command to run
 * @param cwd The working directory to run the command in
 * @returns The result of the command
 * @throws If the command fails
 */
export function runCommand(command: string, cwd: string): string {
  return execSync(command, { cwd, encoding: "utf8", windowsHide: true }).trim();
}
