const github = require('@actions/github');

const { TYPE_FIX, TYPE_FINAL } = require('./types');

module.exports = function (tags) {
  async function createComponentTag({ prefix, type, version, branch, dryRun }) {
    if (type === TYPE_FIX) {
      const releaseBranch = github.context.payload.workflow_run.head_branch;
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
