#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import versionChangelog from "./index.js";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { readPackageFile } from "./package-metadata.js";

const packageMetadata = await readPackageFile(process.cwd());

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: { remote: { type: "string" } },
});

const validRemotes = ["bitbucket", "github", "gitlab"] as const;

function isValidRemote(remote: unknown): remote is (typeof validRemotes)[number] {
  return typeof remote === "string" && (validRemotes as readonly string[]).includes(remote);
}

const fileName = resolve(positionals[0] ?? "CHANGELOG.md");
const remote = isValidRemote(values.remote) ? values.remote : "github";

// Grab the current version of the package.
// When run as part of the `"version"` script
// (for example by `npm release`)
// it will be the _new_ version
const version = packageMetadata.version;

const changelog = await readFile(fileName, "utf8");

const updatedChangelog = await versionChangelog(changelog, { version: version, remote: remote });

await writeFile(fileName, updatedChangelog, "utf8");
