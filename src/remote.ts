export type BrowserUrl = `https://${string}`;

export interface Remote {
  /**
   * Gets the URL of a website to view the repository
   */
  getRepositoryUrl(): BrowserUrl;

  /**
   * Gets the url of a webpage comparing two git versions
   * @param base the tag at the start of the changes to display or null to display all changes before the compare
   * @param compare the tag at the end of the changes to display or null to display all changes after the base
   */
  getChangesUrl(base: string | null, compare: string | null): BrowserUrl;
}

export class GitHub implements Remote {
  readonly owner: string;
  readonly repo: string;

  constructor(owner: string, repo: string) {
    this.owner = owner;
    this.repo = repo;
  }

  static fromUrl(url: string): GitHub {
    const normalizedUrl = url.replace(/\.git(?:#.*)?$/, "");
    const match = normalizedUrl?.match(/github\.com(?::[0-9]*)?\/?(?<owner>[^/]+)\/(?<repo>[^/]+)/);
    if (match?.groups?.owner === undefined || match?.groups?.repo === undefined) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }
    return new GitHub(match.groups.owner, match.groups.repo);
  }

  getRepositoryUrl(): BrowserUrl {
    return `https://github.com/${this.owner}/${this.repo}`;
  }

  getChangesUrl(base: string | null, compare: string | null): BrowserUrl {
    compare ??= "HEAD";

    if (base === null) {
      return `https://github.com/${this.owner}/${this.repo}/tree/${compare}`;
    }

    return `https://github.com/${this.owner}/${this.repo}/compare/${base}...${compare}`;
  }
}

export class Bitbucket implements Remote {
  readonly workspace: string;
  readonly repo: string;

  constructor(workspace: string, repo: string) {
    this.workspace = workspace;
    this.repo = repo;
  }

  static fromUrl(url: string): Bitbucket {
    const normalizedUrl = url.replace(/\.git(?:#.*)?$/, "");
    const match = normalizedUrl?.match(/bitbucket\.org(?::[0-9]*)?\/?(?<workspace>[^/]+)\/(?<repo>[^/]+)/);
    if (match?.groups?.workspace === undefined || match?.groups?.repo === undefined) {
      throw new Error(`Invalid Bitbucket URL: ${url}`);
    }
    return new Bitbucket(match.groups.workspace, match.groups.repo);
  }

  getRepositoryUrl(): BrowserUrl {
    return `https://bitbucket.org/${this.workspace}/${this.repo}`;
  }

  getChangesUrl(base: string | null, compare: string | null): BrowserUrl {
    compare ??= "master";

    if (base === null) {
      return `https://bitbucket.org/${this.workspace}/${this.repo}/commits/tag/${compare}`;
    }

    return `https://bitbucket.org/${this.workspace}/${this.repo}/branches/compare/${compare}%0D${base}`;
  }
}
