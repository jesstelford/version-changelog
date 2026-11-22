#!/usr/bin/env node

// @ts-expect-error - Dependency lacks type definitions
import { parse as gitlabUrlFromGit } from "giturl";
import gitRemote from "./git-remote.js";
import { detectPackageManager, getVersionPrefix } from "./package-manager.js";
import { formatDate } from "./format-date.js";
import { Bitbucket, GitHub } from "./remote.js";

/**
 * Replaces the "Unreleased" heading with a new version heading including the date.
 * @argument data The changelog markdown
 * @argument versionString The new version
 * @returns The updated changelog markdown
 */
function insertHeading(data: string, versionString: string): string {
  return data.replace(/(## \[Unreleased\].*)/g, "$1\n\n## [" + versionString + "][] - " + formatDate(new Date()));
}

type UriResult = {
  unreleased: string;
  previous: string;
};

/**
 * Gets the GitHub URLs for the unreleased and previous versions.
 * @param data The changelog markdown
 * @param newVersion The new version
 * @param prefix The version prefix
 * @returns The GitHub URLs for the unreleased and previous versions
 */
function githubUris(data: string, newVersion: string, prefix: string): UriResult {
  let remote: GitHub | undefined;
  let previousVersion: string | undefined;
  let previousLink: string;

  // Try get previous version and remote from unreleased tag if it exists
  const match = /\[Unreleased\]: (.*)\/compare\/(.*)\.\.\.HEAD/g.exec(data);

  if (match) {
    remote = GitHub.fromUrl(match[1]);
    previousVersion = match[2];
  }

  if (!remote) {
    remote = GitHub.fromUrl(gitRemote());
  }

  previousLink = "[" + newVersion + "]: " + remote.getChangesUrl(previousVersion ?? null, prefix + newVersion);

  return {
    unreleased: "[Unreleased]: " + remote.getChangesUrl(prefix + newVersion, null),
    previous: previousLink,
  };
}

/**
 * Gets the Bitbucket URLs for the unreleased and previous versions.
 * @param data The changelog markdown
 * @param newVersion The new version
 * @param prefix The version prefix
 * @returns The Bitbucket URLs for the unreleased and previous versions
 */
function bitbucketUris(data: string, newVersion: string, prefix: string): UriResult {
  let remote: Bitbucket | undefined;
  let previousVersion: string | undefined;
  let previousLink: string;

  // Try get previous version and remote from unreleased tag if it exists
  const match = /\[Unreleased\]: (.*)\/branches\/compare\/master%0D(.*)/g.exec(data);

  if (match) {
    remote = Bitbucket.fromUrl(match[1]);
    previousVersion = match[2];
  }

  if (!remote) {
    remote = Bitbucket.fromUrl(gitRemote());
  }

  previousLink = "[" + newVersion + "]: " + remote.getChangesUrl(previousVersion ?? null, prefix + newVersion);

  return {
    unreleased: "[Unreleased]: " + remote.getChangesUrl(prefix + newVersion, null),
    previous: previousLink,
  };
}

/**
 * Gets the GitLab URLs for the unreleased and previous versions.
 * @param data The changelog markdown
 * @param newVersion The new version
 * @param prefix The version prefix
 * @returns The GitLab URLs for the unreleased and previous versions
 */
function gitlabUris(data: string, newVersion: string, prefix: string): UriResult {
  let remoteUrl: string | undefined;
  let previousVersion: string | undefined;
  let previousLink: string;

  // Try get previous version and remote from unreleased tag if it exists
  const match = /\[Unreleased\]: (.*)\/compare\/master...(.*)/g.exec(data);

  if (match) {
    remoteUrl = match[1];
    previousVersion = match[2];
  }

  if (!remoteUrl) {
    remoteUrl = gitlabUrlFromGit(gitRemote());
  }

  if (previousVersion) {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/compare/" + prefix + newVersion + "..." + previousVersion;
  } else {
    previousLink = "[" + newVersion + "]: " + remoteUrl + "/tags/" + prefix + newVersion;
  }

  return {
    unreleased: "[Unreleased]: " + remoteUrl + "/compare/master..." + prefix + newVersion,
    previous: previousLink,
  };
}

const UriFunctions = {
  github: githubUris,
  gitlab: gitlabUris,
  bitbucket: bitbucketUris,
} as const;

type Remote = keyof typeof UriFunctions;

/**
 * Updates the urls of the changelog for the given version and remote repository
 * @param data The changelog markdown
 * @param versionString The new version
 * @param remote The remote repository type
 * @returns The updated changelog markdown
 */
async function updateCompareUri(data: string, versionString: string, remote: Remote): Promise<string> {
  const packageManager = await detectPackageManager(process.cwd());
  const prefix = getVersionPrefix(packageManager);
  const uris = UriFunctions[remote](data, versionString, prefix);

  if (data.match(/\[Unreleased\]:/)) {
    return data.replace(/\[Unreleased\]:.*/, uris.unreleased + "\n" + uris.previous);
  }

  return data + "\n\n" + uris.unreleased + "\n" + uris.previous;
}

/**
 * Update the changelog with the new version and remote repository URLs
 * @param data the changelog markdown
 * @param version The version and remote repository type
 * @return the modified changelog markdown
 */
export default async function versionChangelog(
  data: string,
  { version, remote }: { version: string; remote?: Remote },
): Promise<string> {
  // Add the heading for the new version number
  data = insertHeading(data, version);

  // Update the [Unreleased] URI
  // and add the new version URI
  data = await updateCompareUri(data, version, remote ?? "github");

  return data;
}
