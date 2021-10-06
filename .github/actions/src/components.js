const { TYPE_FIX, TYPE_FINAL } = require('./types');

module.exports = function (tags) {
  async function createComponentTag({ prefix, type, version, branch, dryRun }) {
    if (type === TYPE_FIX) {
      return tags.createComponentFixTag(prefix, version, branch, dryRun);
    }

    if (type === TYPE_FINAL) {
      const lastTag = await tags.getLastComponentReleaseTag(prefix);

      console.log(`Last tag: ${lastTag}`);
      return tags.createComponentFinalTag(prefix, lastTag, branch, dryRun);
    }
  }

  return {
    createComponentTag,
  };
};
