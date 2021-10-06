const core = require('@actions/core');
const github = require('@actions/github');

const { TYPE_PRE_RELEASE, TYPE_NEW_RELEASE_BRANCH, TYPE_FIX, TYPE_FINAL } = require('./types');
const { parseVersion } = require('./strings');

module.exports = function (tags, branches) {
  async function createNewReleaseBranch(releaseBranchPrefix, dryRun) {
    const tag = await tags.getLastPreReleaseTag();
    if (!tag) {
      return core.setFailed('There are any pre-release yet');
    }

    const { major, minor } = parseVersion(tag);

    const releaseBranch = `${releaseBranchPrefix}${major}.${minor}`;
    if (!dryRun) {
      const created = await branches.createBranch(releaseBranch);

      if (!created) {
        return core.setFailed(`The release branch '${releaseBranch}' already exist`);
      }
    }

    console.log(`🚀 New release '${releaseBranch}' created`);
    return releaseBranch;
  }

  async function createProductFinalTag(releaseBranch, dryRun) {
    if (!releaseBranch) {
      return core.setFailed('You need to specify the release branch to tag');
    }

    const tag = await tags.getLastPreReleaseTag();
    if (!tag) {
      return core.setFailed('There are any pre-release yet');
    }
    console.log(`Create release tag in branch ${releaseBranch}`);

    const { major, minor } = parseVersion(tag);

    const releaseTag = `v${major}.${minor}.0`;
    if (!dryRun) {
      await tags.createTag(releaseTag, releaseBranch);
    }

    console.log(`🚀 New release tag '${releaseTag}' created`);

    return releaseTag;
  }
  async function createProductFixTag(releaseBranchPrefix, currentBranchName, dryRun) {
    const releaseVersion = currentBranchName.replace(releaseBranchPrefix, '');
    const tag = await tags.getLatestTagFromReleaseVersion(releaseVersion);
    if (!tag) {
      return core.setFailed('There are any release yet');
    }

    const { major, minor, patch } = parseVersion(tag);

    const fixTag = `v${major}.${minor}.${patch + 1}`;
    if (!dryRun) {
      await tags.createTag(fixTag, currentBranchName);
    }

    console.log(`🚀 New fix '${fixTag}' created`);
    return fixTag;
  }

  async function processProduct({ releaseBranchPrefix, type, preReleaseName, branch, dryRun }) {
    if (type === TYPE_PRE_RELEASE) {
      const preReleaseVersion = branches.calcPreReleaseVersionBasedOnReleaseBranches(0, releaseBranchPrefix);
      return tags.createProductPreReleaseTag(releaseBranchPrefix, preReleaseVersion, preReleaseName, branch, dryRun);
    }

    if (type === TYPE_NEW_RELEASE_BRANCH) {
      return createNewReleaseBranch(releaseBranchPrefix);
    }

    if (type === TYPE_FIX) {
      const currentBranchName = github.context.ref;
      return createProductFixTag(releaseBranchPrefix, currentBranchName, dryRun);
    }

    if (type === TYPE_FINAL) {
      return createProductFinalTag(branch, dryRun);
    }
  }

  return {
    processProduct,
  };
};
