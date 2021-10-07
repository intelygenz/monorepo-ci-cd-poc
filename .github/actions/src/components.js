const github = require('@actions/github');

const { TYPE_FIX, TYPE_FINAL } = require('./types');

module.exports = function (tags) {
  async function createComponentTag({ prefix, type, version, branch, dryRun }) {
    if (type === TYPE_FIX) {
      version = version.replace(`${prefix}`, '');
      const releaseBranch = github.context.payload.ref.replace('refs/heads/', '');
      return tags.createComponentFixTag(prefix, version, releaseBranch, dryRun);
    }

    if (type === TYPE_FINAL) {
      const lastTag = await tags.getLastComponentReleaseTag(prefix);

      version = lastTag.replace(prefix, '');
      return tags.createComponentFinalTag(prefix, branch, version, dryRun);
    }
  }

  return {
    createComponentTag,
  };
};
