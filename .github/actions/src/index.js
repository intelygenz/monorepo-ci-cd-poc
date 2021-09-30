const core = require('@actions/core');
const github = require('@actions/github');

const { run } = require('./run');

// Input variables
const dryRun = core.getInput('dry-run') === 'true';
const prefix = core.getInput('prefix');
const type = core.getInput('type');
const mode = core.getInput('mode');
const defaultBranch = core.getInput('default-branch');
const currentVersion = core.getInput('current-version');

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

run(octokit, owner, repo, {
  prefix,
  mode,
  type,
  dryRun,
  defaultBranch,
  currentVersion,
});
