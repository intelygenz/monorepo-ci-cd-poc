const core = require('@actions/core');
const newTagger = require('./tags');
const newBranches = require('./branches');
const newComponents = require('./components');
const newProduct = require('./product');
const { MODE_COMPONENT, MODE_PRODUCT, MODE_QUERY } = require('./types');

async function run(
  octokit,
  owner,
  repo,
  {
    componentPrefix,
    releaseBranchPrefix,
    mode,
    type,
    dryRun,
    defaultBranch,
    currentVersion,
    currentMajor,
    preReleaseName,
  }
) {
  const tags = newTagger(octokit, owner, repo);
  const branches = newBranches(octokit, owner, repo);
  const components = newComponents(tags);
  const product = newProduct(tags, branches);

  console.log(`Run action with params: mode ${mode} and type ${type}`);
  console.log(`mode ${mode} and type ${type}`);
  const options = {
    componentPrefix,
    releaseBranchPrefix,
    mode,
    type,
    dryRun,
    defaultBranch,
    currentVersion,
    currentMajor,
    preReleaseName,
  };
  console.log(options);

  let tag;

  switch (mode) {
    case MODE_QUERY:
      // component-last-version
      tag = await tags.getLastComponentReleaseTag(componentPrefix);

      if (!tag) {
        core.setFailed('Tag not found');
        return;
      }

      console.log(`Found tag '${tag}'.`);

      break;

    case MODE_COMPONENT:
      tag = await components.createComponentTag({
        prefix: componentPrefix,
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
        currentMajor,
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
