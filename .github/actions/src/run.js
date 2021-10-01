const core = require('@actions/core');
const newTagger = require('./tags');
const newComponents = require('./components');
const newProduct = require('./product');

export async function run(
  octokit,
  owner,
  repo,
  { componentPrefix, releaseBranchPrefix, mode, type, dryRun, defaultBranch, currentVersion, preReleaseName }
) {
  const tags = newTagger(octokit, owner, repo);
  const components = newComponents(tags);
  const product = newProduct(tags);

  console.log(`Run action with mode ${mode}`);

  let tag;

  switch (mode) {
    case 'component':
      tag = await components.processComponent({
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
      core.setOutput('tag', tag);
      break;

    case 'product':
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
}
