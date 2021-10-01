module.exports = function (tags) {
  async function processProduct({ releaseBranchPrefix, type, preReleaseName, branch, dryRun }) {
    if (type === 'pre-release') {
      return tags.createProductPreReleaseTag(releaseBranchPrefix, preReleaseName, branch, dryRun);
    }
  }

  return {
    processProduct,
  };
};
