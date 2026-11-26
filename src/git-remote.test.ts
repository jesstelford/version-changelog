import { describe, it, vi, expect } from "vitest";
import gitRemote, { isGitUrl } from "./git-remote.js";
import { runCommand } from "./run-command.js";

vi.mock(import("./run-command.js"), () => ({
  runCommand: vi.fn(),
}));

describe("isGitUrl", () => {
  it("should return true for valid git urls", () => {
    expect(isGitUrl("https://github.com/user/repo.git")).toBe(true);
    expect(isGitUrl("git+https://github.com/user/repo.git")).toBe(true);
    expect(isGitUrl("git@github.com:user/repo.git")).toBe(true);
    expect(isGitUrl("git+ssh://github.com/user/repo.git")).toBe(true);
    expect(isGitUrl("ssh://git@ssh.github.com:443/user/repo.git")).toBe(true);
    expect(isGitUrl("git://github.com/user/repo.git")).toBe(true);
  });

  it("should return false for invalid git urls", () => {
    expect(isGitUrl("")).toBe(false);
    expect(isGitUrl("no remote configured")).toBe(false);
    expect(isGitUrl("github.com/user/repo")).toBe(false);
  });
});

describe("gitRemote", () => {
  it("should get remote.origin.url from the git config", () => {
    vi.mocked(runCommand).mockReturnValue("https://github.com/user/repo.git");

    expect(gitRemote("cwd")).toBe("https://github.com/user/repo.git");

    expect(vi.mocked(runCommand)).toHaveBeenCalledExactlyOnceWith("git config --get remote.origin.url", "cwd");
  });

  it("should throw an error if no remote is configured", () => {
    vi.mocked(runCommand).mockReturnValue("");

    expect(() => gitRemote("cwd")).toThrow();
  });

  it("should throw an error if the remote URL is invalid", () => {
    vi.mocked(runCommand).mockReturnValue("invalid-url");

    expect(() => gitRemote("cwd")).toThrow();
  });
});
