const { TYPE_PRE_RELEASE } = require('./types');

module.exports = function (tags) {
  async function processProduct({ releaseBranchPrefix, type, preReleaseName, branch, dryRun }) {
    if (type === TYPE_PRE_RELEASE) {
      return tags.createProductPreReleaseTag(releaseBranchPrefix, preReleaseName, branch, dryRun);
    }
  }

  return {
    processProduct,
  };
};
