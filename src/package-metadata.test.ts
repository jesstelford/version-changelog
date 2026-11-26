import { describe, expect, it, vi } from "vitest";
import { parsePackageMetadata, readPackageFile } from "./package-metadata.js";
import { readFile } from "node:fs/promises";

vi.mock(import("node:fs/promises"), () => ({
  readFile: vi.fn(),
}));

describe("parsePackageMetadata", () => {
  it("should parse the version", () => {
    expect(parsePackageMetadata({ version: "1.0.0" })).toEqual({
      version: "1.0.0",
    });
  });

  it("should parse the homepage", () => {
    expect(
      parsePackageMetadata({
        version: "1.0.0",
        homepage: "https://github.com/nstringham/update-changelog-version#readme",
      }),
    ).toEqual({
      version: "1.0.0",
      homepage: "https://github.com/nstringham/update-changelog-version#readme",
    });
  });

  it("should parse the repository from a string", () => {
    expect(
      parsePackageMetadata({
        version: "1.0.0",
        repository: "git+https://github.com/nstringham/update-changelog-version.git",
      }),
    ).toEqual({
      version: "1.0.0",
      repository: "git+https://github.com/nstringham/update-changelog-version.git",
    });
  });

  it("should parse the repository from an object", () => {
    expect(
      parsePackageMetadata({
        version: "1.0.0",
        repository: {
          type: "git",
          url: "git+https://github.com/nstringham/update-changelog-version.git",
        },
      }),
    ).toEqual({
      version: "1.0.0",
      repository: "git+https://github.com/nstringham/update-changelog-version.git",
    });
  });

  it("should parse the package manager from packageManager", () => {
    expect(
      parsePackageMetadata({
        version: "1.0.0",
        packageManager: "pnpm@9.0.0",
      }),
    ).toEqual({
      version: "1.0.0",
      packageManager: "pnpm",
    });
  });

  it("should parse the package manager from devEngines", () => {
    expect(
      parsePackageMetadata({
        version: "1.0.0",
        devEngines: {
          packageManager: {
            name: "pnpm",
            version: "9.0.0",
          },
        },
      }),
    ).toEqual({
      version: "1.0.0",
      packageManager: "pnpm",
    });
  });

  it("should prefer packageManager over devEngines", () => {
    expect(
      parsePackageMetadata({
        version: "1.0.0",
        packageManager: "yarn@10.0.0",
        devEngines: {
          packageManager: {
            name: "pnpm",
            version: "9.0.0",
          },
        },
      }),
    ).toEqual({
      version: "1.0.0",
      packageManager: "yarn",
    });
  });

  it("should parse this packages package.json", () => {
    const packageJson = require("../package.json");
    expect(parsePackageMetadata(packageJson)).toEqual({
      version: packageJson.version,
      homepage: "https://github.com/nstringham/update-changelog-version#readme",
      repository: "git+https://github.com/nstringham/update-changelog-version.git",
      packageManager: "pnpm",
    });
  });

  it("should require package.json to be an object", () => {
    expect(() => parsePackageMetadata('{version: "1.0.0"}')).toThrow(
      "Invalid package.json: package.json must be an object",
    );
  });

  it("should require version to be a string", () => {
    expect(() => parsePackageMetadata({ version: 1.0 })).toThrow("Invalid package.json: version must be a string");
  });

  it("should require homepage to be a string", () => {
    expect(() => parsePackageMetadata({ version: "1.0.0", homepage: { url: "http://example.com" } })).toThrow(
      "Invalid package.json: homepage must be a string",
    );
  });

  it("should require repository to be a string or an object with a url", () => {
    expect(() => parsePackageMetadata({ version: "1.0.0", repository: 1 })).toThrow(
      "Invalid package.json: repository must be a string or an object",
    );

    expect(() => parsePackageMetadata({ version: "1.0.0", repository: {} })).toThrow(
      "Invalid package.json: repository.url must be a string",
    );
  });

  it("should require packageManager to be a string", () => {
    expect(() => parsePackageMetadata({ version: "1.0.0", packageManager: { name: "pnpm" } })).toThrow(
      "Invalid package.json: packageManager must be a string",
    );
  });

  it("should require devEngines to be an object with a name", () => {
    expect(() => parsePackageMetadata({ version: "1.0.0", devEngines: "pnpm" })).toThrow(
      "Invalid package.json: devEngines must be an object",
    );

    expect(() => parsePackageMetadata({ version: "1.0.0", devEngines: { packageManager: "pnpm" } })).toThrow(
      "Invalid package.json: devEngines.packageManager must be an object",
    );

    expect(() => parsePackageMetadata({ version: "1.0.0", devEngines: { packageManager: {} } })).toThrow(
      "Invalid package.json: devEngines.packageManager.name must be a string",
    );
  });
});

describe("readPackageFile", () => {
  it("should read package.json in the directory", async () => {
    vi.mocked(readFile).mockResolvedValue('{ "version": "1.0.0" }');
    await expect(readPackageFile("cwd")).resolves.toEqual({ version: "1.0.0" });
  });

  it("should not read package.json a second time in the same directory", async () => {
    vi.mocked(readFile).mockResolvedValue('{ "version": "1.0.0" }');

    await readPackageFile("cwd1");
    await readPackageFile("cwd2");
    await readPackageFile("cwd2");
    await readPackageFile("cwd1");

    expect(readFile).toHaveBeenCalledTimes(2);
    expect(readFile).toHaveBeenNthCalledWith(1, "cwd1/package.json", "utf-8");
    expect(readFile).toHaveBeenNthCalledWith(2, "cwd2/package.json", "utf-8");
  });
});
