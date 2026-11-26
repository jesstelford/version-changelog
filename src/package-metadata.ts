import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type PackageMetadata = {
  version: string;
  homepage?: string;
  repository?: string;
  packageManager?: string;
};

export class InvalidPackageMetadataError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super("Invalid package.json: " + message, options);
    this.name = "InvalidPackageMetadataError";
  }
}

export function parsePackageMetadata(packageJson: unknown): PackageMetadata {
  if (typeof packageJson !== "object" || packageJson === null) {
    throw new InvalidPackageMetadataError("package.json must be an object");
  }

  if (!("version" in packageJson) || typeof packageJson.version !== "string") {
    throw new InvalidPackageMetadataError("version must be a string");
  }

  const packageMetadata: PackageMetadata = {
    version: packageJson.version,
  };

  if ("homepage" in packageJson) {
    if (typeof packageJson.homepage !== "string") {
      throw new InvalidPackageMetadataError("homepage must be a string");
    }
    packageMetadata.homepage = packageJson.homepage;
  }

  if ("repository" in packageJson) {
    if (typeof packageJson.repository === "string") {
      packageMetadata.repository = packageJson.repository;
    } else if (typeof packageJson.repository === "object" && packageJson.repository !== null) {
      if (!("url" in packageJson.repository) || typeof packageJson.repository.url !== "string") {
        throw new InvalidPackageMetadataError("repository.url must be a string");
      }
      packageMetadata.repository = packageJson.repository.url;
    } else {
      throw new InvalidPackageMetadataError("repository must be a string or an object");
    }
  }

  if ("packageManager" in packageJson) {
    if (typeof packageJson.packageManager !== "string") {
      throw new InvalidPackageMetadataError("packageManager must be a string");
    }
    packageMetadata.packageManager = packageJson.packageManager.split("@")[0];
  } else if ("devEngines" in packageJson) {
    if (typeof packageJson.devEngines !== "object" || packageJson.devEngines === null) {
      throw new InvalidPackageMetadataError("devEngines must be an object");
    }

    if ("packageManager" in packageJson.devEngines) {
      const packageManager = packageJson.devEngines.packageManager;
      if (typeof packageManager !== "object" || packageManager === null) {
        throw new InvalidPackageMetadataError("devEngines.packageManager must be an object");
      }
      if (!("name" in packageManager) || typeof packageManager.name !== "string") {
        throw new InvalidPackageMetadataError("devEngines.packageManager.name must be a string");
      }
      packageMetadata.packageManager = packageManager.name;
    }
  }

  return packageMetadata;
}

const packageMetadataCache = new Map<string, Readonly<PackageMetadata>>();

export async function readPackageFile(cwd: string): Promise<Readonly<PackageMetadata>> {
  if (packageMetadataCache.has(cwd)) {
    return packageMetadataCache.get(cwd)!;
  }

  const packageJson = await readFile(join(cwd, "package.json"), "utf-8");

  const metadata = parsePackageMetadata(JSON.parse(packageJson));

  packageMetadataCache.set(cwd, metadata);
  return metadata;
}
