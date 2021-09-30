const { parseVersion } = require('./strings');

module.exports = function (octokit, owner, repo) {
  async function getLastComponentReleaseTag(prefix) {
    return getLastTag(`^${prefix}`);
  }

  async function getLastTag(regex) {
    const tagNames = await searchTagNames(octokit, owner, repo);
    const tagsWithComponent = tagNames.filter((tagName) => {
      return tagName.match(regex);
    });
    if (tagsWithComponent.length !== 0) {
      return tagsWithComponent[0];
    }

    return null;
  }

  async function searchTagNames() {
    let tagNames = [];
    let data_length = 0;
    let page = 0;
    do {
      const { data } = await octokit.repos.listTags({
        owner,
        repo,
        per_page: 100,
        page,
      });
      const tagNamesPerPage = data.map((tag) => tag.name);
      data_length = tagNamesPerPage.length;
      tagNames.push(...tagNamesPerPage);
      page++;
    } while (data_length === 100);

    return tagNames;
  }

  async function createTag(tagName, branch) {
    console.log('Creating tag');
    const { data: branchData } = await octokit.repos.getBranch({
      owner,
      repo,
      branch,
    });
    const mainBranchSHA = branchData.commit.sha;
    const { data: tagData } = await octokit.git.createTag({
      owner,
      repo,
      tag: tagName,
      message: `Release ${tagName}`,
      object: mainBranchSHA,
      type: 'commit',
    });
    const { data: createTagData } = await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/tags/${tagName}`,
      sha: tagData.sha,
      object: mainBranchSHA,
      type: 'commit',
    });
    console.log('Tag ref created: ', createTagData.ref);
  }

  async function createComponentFixTag(prefix, type, branch, version, dryRun) {
    const { major, minor, patch } = parseVersion(version);
    const releaseTag = `${prefix}v${major}.${minor}.${patch + 1}`;

    if (!dryRun) {
      await createTag(releaseTag, branch);
    }

    return releaseTag;
  }

  async function createComponentFinalTag(prefix, type, branch, version, dryRun) {
    const { major, minor } = parseVersion(version);
    const releaseTag = `${prefix}v${major}.${minor + 1}.0`;

    if (!dryRun) {
      await createTag(releaseTag, branch);
    }

    return releaseTag;
  }
  return {
    getLastComponentReleaseTag, // TODO: remove from export and fix tests
    createComponentFixTag,
    createComponentFinalTag,
  };
};
