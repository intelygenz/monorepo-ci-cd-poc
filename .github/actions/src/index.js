const core = require('@actions/core');
const github = require('@actions/github');

const { run } = require('./run');

// Input variables
const dryRun = core.getInput('dry-run') === 'true';
const componentPrefix = core.getInput('component-prefix');
const releaseBranchPrefix = core.getInput('release-branch-prefix');
const preReleaseName = core.getInput('pre-release-name');
const type = core.getInput('type');
const mode = core.getInput('mode');
const defaultBranch = core.getInput('default-branch');
const currentVersion = core.getInput('current-version');

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

console.log('octokit: ', octokit.repos);

try {
  run(octokit, owner, repo, {
    componentPrefix,
    releaseBranchPrefix,
    mode,
    type,
    dryRun,
    defaultBranch,
    currentVersion,
    preReleaseName,
  });
} catch (e) {
  core.setFailed(`RUN ERROR: \n\t${e}`);
}
