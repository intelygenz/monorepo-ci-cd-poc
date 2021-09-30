const core = require('@actions/core');
const newTagger = require('./tags');
const newComponents = require('./components');

export async function run(octokit, owner, repo, { prefix, mode, type, dryRun, defaultBranch, currentVersion }) {
  const tags = newTagger(octokit, owner, repo);
  const components = newComponents(tags);

  console.log(`Run action with mode ${mode}`);
  switch (mode) {
    case 'component':
      const tag = await components.processComponent({
        prefix,
        type,
        version: currentVersion,
        branch: defaultBranch,
        dryRun,
      });

      if (!tag) {
        return core.setFailed('There are not any component release yet');
      }
      console.log(`🚀 New component tag '${tag}' created`);
      core.setOutput('tag', tag);
      break;

    case 'product':
      // TODO
      break;
    default:
      return core.setFailed(`Unknown mode "${mode}"`);
  }
}
