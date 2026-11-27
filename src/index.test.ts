import { beforeEach, describe, it, expect, vi } from "vitest";

import { formatDate } from "./format-date.js";
import gitRemote from "./git-remote.js";

vi.mock(import("./git-remote.js"), () => ({ default: vi.fn() }));

import versionChangelog from "./index.js";

const todayDate = formatDate(new Date());

const versionPrefix = "v";

describe("Versioning Changelog", function () {
  beforeEach(() => {
    vi.mocked(gitRemote).mockClear();
    vi.mocked(gitRemote).mockReturnValue("git@github.com:nstringham/update-changelog-version.git");
  });

  it.skip("Handles a non-git repo correctly", () => {
    // TODO: Test when the `.git` folder doesn't exist
  });

  it("Correctly adds a new version", async () => {
    const data = await versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo
      `.trim(),
      {
        version: "1.0.0",
      },
    );

    expect(data).toBe(
      `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0
      `.trim(),
    );
  });

  it("Correctly updates old unreleased sections", async () => {
    const data = await versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0

      `.trim(),
      {
        version: "2.0.0",
      },
    );

    expect(data).toBe(
      `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}2.0.0...HEAD
[2.0.0]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...${versionPrefix}2.0.0
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0
      `.trim(),
    );
  });

  describe("gitlab", function () {
    it("Correctly adds a new gitlab version", async () => {
      vi.mocked(gitRemote).mockReturnValue("git@gitlab.com:nstringham/update-changelog-version.git");
      const data = await versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo
        `.trim(),
        {
          version: "1.0.0",
          remote: "gitlab",
        },
      );

      expect(data).toBe(
        `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: http://gitlab.com/nstringham/update-changelog-version/compare/master...${versionPrefix}1.0.0
[1.0.0]: http://gitlab.com/nstringham/update-changelog-version/tags/${versionPrefix}1.0.0
        `.trim(),
      );
    });

    it("Correctly updates old unreleased sections with gitlab urls", async () => {
      const data = await versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: http://gitlab.com/nstringham/update-changelog-version/compare/master...${versionPrefix}1.0.0
[1.0.0]: http://gitlab.com/nstringham/update-changelog-version/tags/${versionPrefix}1.0.0
        `.trim(),
        {
          version: "2.0.0",
          remote: "gitlab",
        },
      );

      expect(data).toBe(
        `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: http://gitlab.com/nstringham/update-changelog-version/compare/master...${versionPrefix}2.0.0
[2.0.0]: http://gitlab.com/nstringham/update-changelog-version/compare/${versionPrefix}2.0.0...${versionPrefix}1.0.0
[1.0.0]: http://gitlab.com/nstringham/update-changelog-version/tags/${versionPrefix}1.0.0
        `.trim(),
      );
    });
  });

  describe("bitbucket", function () {
    it("Correctly adds a new bitbucket version", async () => {
      vi.mocked(gitRemote).mockReturnValue("git@bitbucket.org:nstringham/update-changelog-version.git");
      const data = await versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo
        `.trim(),
        {
          version: "1.0.0",
          remote: "bitbucket",
        },
      );

      expect(data).toBe(
        `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}
- Foo

[Unreleased]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/nstringham/update-changelog-version/commits/tag/${versionPrefix}1.0.0
        `.trim(),
      );
    });

    it("Correctly updates old unreleased sections with bitbucket urls", async () => {
      const data = await versionChangelog(
        `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/nstringham/update-changelog-version/commits/tag/${versionPrefix}1.0.0

        `.trim(),
        {
          version: "2.0.0",
          remote: "bitbucket",
        },
      );

      expect(data).toBe(
        `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/master%0D${versionPrefix}2.0.0
[2.0.0]: https://bitbucket.org/nstringham/update-changelog-version/branches/compare/${versionPrefix}2.0.0%0D${versionPrefix}1.0.0
[1.0.0]: https://bitbucket.org/nstringham/update-changelog-version/commits/tag/${versionPrefix}1.0.0
        `.trim(),
      );
    });
  });

  it("Correctly handles empty Unreleased section", async () => {
    const data = await versionChangelog(
      `
# Changelog

## [Unreleased][]
      `.trim(),
      {
        version: "1.0.0",
      },
    );

    expect(data).toBe(
      `
# Changelog

## [Unreleased][]

## [1.0.0][] - ${todayDate}

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}1.0.0...HEAD
[1.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}1.0.0
      `.trim(),
    );
  });

  it("Correctly skips old versions for links", async () => {
    const data = await versionChangelog(
      `
# Changelog

## [Unreleased][]
- Foo

## [1.0.0][] - 2016-10-10
- Bar
      `.trim(),
      {
        version: "2.0.0",
      },
    );

    expect(data).toBe(
      `
# Changelog

## [Unreleased][]

## [2.0.0][] - ${todayDate}
- Foo

## [1.0.0][] - 2016-10-10
- Bar

[Unreleased]: https://github.com/nstringham/update-changelog-version/compare/${versionPrefix}2.0.0...HEAD
[2.0.0]: https://github.com/nstringham/update-changelog-version/tree/${versionPrefix}2.0.0
      `.trim(),
    );
  });
});
