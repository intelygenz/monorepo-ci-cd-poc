const core = require('@actions/core');
const newTagger = require('./tags');
const newBranches = require('./branches');
const newComponents = require('./components');
const newProduct = require('./product');
const { MODE_COMPONENT, MODE_PRODUCT } = require('./types');

async function run(
  octokit,
  owner,
  repo,
  { componentPrefix, releaseBranchPrefix, mode, type, dryRun, defaultBranch, currentVersion, preReleaseName }
) {
  const tags = newTagger(octokit, owner, repo);
  const branches = newBranches(octokit, owner, repo);
  const components = newComponents(tags);
  const product = newProduct(tags, branches);

  console.log(`Run action with mode ${mode}`);

  let tag;

  switch (mode) {
    case MODE_COMPONENT:
      tag = await components.createComponentTag({
        componentPrefix,
        type,
        version: currentVersion,
        branch: defaultBranch,
        dryRun,
      });

      if (!tag) {
        return core.setFailed('Tag creation failed');
      }
      console.log(`🚀 New component tag '${tag}' created`);

      break;

    case MODE_PRODUCT:
      tag = await product.processProduct({
        releaseBranchPrefix,
        type,
        preReleaseName,
        branch: defaultBranch,
        dryRun,
      });
      break;
    default:
      return core.setFailed(`Unknown mode "${mode}"`);
  }
  core.setOutput('tag', tag);
}

module.exports = {
  run,
};
