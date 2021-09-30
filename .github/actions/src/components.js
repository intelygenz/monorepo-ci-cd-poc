module.exports = function (tags) {
  async function processComponent({ prefix, type, version, branch, dryRun }) {
    if (type === 'fix') {
      return tags.createComponentFixTag(prefix, type, version, branch, dryRun);
    }

    if (type === 'final') {
      const lastTag = await tags.getLastComponentReleaseTag(prefix);
      return tags.createComponentFinalTag(prefix, type, lastTag, branch, dryRun);
    }
  }

  return {
    processComponent,
  };
};
