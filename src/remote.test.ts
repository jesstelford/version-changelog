import { describe, it, expect } from "vitest";
import { Bitbucket, GitHub } from "./remote.js";

describe("GitHub", () => {
  describe("fromUrl", () => {
    it("should support git://*", () => {
      const gitUrl = "git://github.com/jamesor/mongoose-versioner";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/jamesor/mongoose-versioner");
    });

    it("should support git://*.git", () => {
      const gitUrl = "git://github.com/treygriffith/cellar.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/treygriffith/cellar");
    });

    it("should support https://*", () => {
      const gitUrl = "https://github.com/Empeeric/i18n-node";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/Empeeric/i18n-node");
    });

    it("should support https://*.git", () => {
      const gitUrl = "https://jpillora@github.com/banchee/tranquil.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/banchee/tranquil");
    });

    it("should throw error on failure", () => {
      const gitUrl = "git://github.com/justgord/.git";
      expect(() => GitHub.fromUrl(gitUrl)).toThrow("Invalid GitHub URL");
    });

    it("should parse git@github.com:bcoe/thumbd.git", () => {
      const gitUrl = "git@github.com:bcoe/thumbd.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git@github.com:/bcoe/thumbd.git", () => {
      const gitUrl = "git@github.com:/bcoe/thumbd.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git@github.com:bcoe/thumbd.git#2.7.0", () => {
      const gitUrl = "git@github.com:bcoe/thumbd.git#2.7.0";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git+https://github.com/bcoe/thumbd.git", () => {
      const gitUrl = "git+https://github.com/bcoe/thumbd.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse git+ssh://github.com/bcoe/thumbd.git", () => {
      const gitUrl = "git+ssh://github.com/bcoe/thumbd.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/bcoe/thumbd");
    });

    it("should parse https://EastCloud@github.com/EastCloud/node-websockets.git", () => {
      const gitUrl = "https://EastCloud@github.com/EastCloud/node-websockets.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/EastCloud/node-websockets");
    });

    it("should parse ssh://git@ssh.github.com:443/nstringham/update-changelog-version.git", () => {
      const gitUrl = "ssh://git@ssh.github.com:443/nstringham/update-changelog-version.git";
      expect(GitHub.fromUrl(gitUrl).getRepositoryUrl()).toBe("https://github.com/nstringham/update-changelog-version");
    });

    it("should parse https://github.com/nstringham/update-changelog-version/tree/v1.0.0", () => {
      const url = "https://github.com/nstringham/update-changelog-version/tree/v1.0.0";
      expect(GitHub.fromUrl(url).getRepositoryUrl()).toBe("https://github.com/nstringham/update-changelog-version");
    });

    it("should parse https://github.com/nstringham/update-changelog-version/compare/v1.0.0...HEAD", () => {
      const url = "https://github.com/nstringham/update-changelog-version/compare/v1.0.0...HEAD";
      expect(GitHub.fromUrl(url).getRepositoryUrl()).toBe("https://github.com/nstringham/update-changelog-version");
    });
  });

  describe("getChangesUrl", () => {
    it("should return a tree url when the base is null", () => {
      const github = new GitHub("nstringham", "update-changelog-version");
      expect(github.getChangesUrl(null, "v1.0.0")).toBe(
        "https://github.com/nstringham/update-changelog-version/tree/v1.0.0",
      );
    });

    it("should compare to HEAD when compare is null", () => {
      const github = new GitHub("nstringham", "update-changelog-version");
      expect(github.getChangesUrl("v1.0.0", null)).toBe(
        "https://github.com/nstringham/update-changelog-version/compare/v1.0.0...HEAD",
      );
    });

    it("should compare compare to base when both base and compare are not null", () => {
      const github = new GitHub("nstringham", "update-changelog-version");
      expect(github.getChangesUrl("v1.0.0", "v1.0.1")).toBe(
        "https://github.com/nstringham/update-changelog-version/compare/v1.0.0...v1.0.1",
      );
    });
  });
});

describe("Bitbucket", () => {
  describe("fromUrl", () => {
    it("should support git://*", () => {
      const gitUrl = "git@bitbucket.org:alex-e-leon/node-bitbucket-url-from-git.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should support git://*.git", () => {
      const gitUrl = "git://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should support https://*", () => {
      const gitUrl = "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should support https://*.git", () => {
      const gitUrl = "https://alex@bitbucket.org/alex-e-leon/node-bitbucket-url-from-git.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should throw error on failure", () => {
      const gitUrl = "git://bitbucket.org/alex-e-leon/.git";
      expect(() => Bitbucket.fromUrl(gitUrl)).toThrow("Invalid Bitbucket URL");
    });

    it("should parse git@bitbucket.org:/alex-e-leon/node-bitbucket-url-from-git.git", () => {
      const gitUrl = "git@bitbucket.org:/alex-e-leon/node-bitbucket-url-from-git.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should parse git@github.com:bcoe/thumbd.git#2.7.0", () => {
      const gitUrl = "git@bitbucket.org:alex-e-leon/node-bitbucket-url-from-git.git#2.7.0";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should parse git+https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git.git", () => {
      const gitUrl = "git+https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should parse git+ssh://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git.git", () => {
      const gitUrl = "git+ssh://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/alex-e-leon/node-bitbucket-url-from-git",
      );
    });

    it("should parse git@ssh.bitbucket.org:nstringham/update-changelog-version.git", () => {
      const gitUrl = "git@ssh.bitbucket.org:nstringham/update-changelog-version.git";
      expect(Bitbucket.fromUrl(gitUrl).getRepositoryUrl()).toBe(
        "https://bitbucket.org/nstringham/update-changelog-version",
      );
    });

    it("should parse https://bitbucket.org/nstringham/update-changelog-version", () => {
      const url = "https://bitbucket.org/nstringham/update-changelog-version";
      expect(Bitbucket.fromUrl(url).getRepositoryUrl()).toBe(
        "https://bitbucket.org/nstringham/update-changelog-version",
      );
    });
  });

  describe("getChangesUrl", () => {
    it("should return a tag url when the base is null", () => {
      const bitbucket = new Bitbucket("nstringham", "update-changelog-version");
      expect(bitbucket.getChangesUrl(null, "v1.0.0")).toBe(
        "https://bitbucket.org/nstringham/update-changelog-version/commits/tag/v1.0.0",
      );
    });

    it("should compare to master when compare is null", () => {
      const bitbucket = new Bitbucket("nstringham", "update-changelog-version");
      expect(bitbucket.getChangesUrl("v1.0.0", null)).toBe(
        "https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0Dv1.0.0",
      );
    });

    it("should compare compare to base when both base and compare are not null", () => {
      const bitbucket = new Bitbucket("nstringham", "update-changelog-version");
      expect(bitbucket.getChangesUrl("v1.0.0", "v1.0.1")).toBe(
        "https://bitbucket.org/nstringham/update-changelog-version/branches/compare/v1.0.1%0Dv1.0.0",
      );
    });
  });
});
