module.exports = function (tags) {
  async function processComponent({ prefix, type, version, branch, dryRun }) {
    if (type === 'fix') {
      return tags.createComponentFixTag(prefix, version, branch, dryRun);
    }

    if (type === 'final') {
      const lastTag = await tags.getLastComponentReleaseTag(prefix);
      return tags.createComponentFinalTag(prefix, lastTag, branch, dryRun);
    }
  }

  return {
    processComponent,
  };
};
