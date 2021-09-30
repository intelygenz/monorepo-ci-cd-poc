const core = require('@actions/core');
const github = require('@actions/github');

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

// Initialize Modules
const { readWorkflowsAndFilterByName, checkWorkflowDeps } =
  require('./workflows')(octokit, owner, repo);

const { calcPreReleaseBranch, createBranch } = require('./branches')(
  octokit,
  owner,
  repo
);
const {
  existsCommitInLastTags,
  calcPrereleaseTag,
  getLastPreReleaseTag,
  getLastComponentReleaseTag,
  getLastReleaseTagFromReleaseBranch,
  createTag,
} = require('./tags')(octokit, owner, repo);

// Input variables
const dryRun = core.getInput('dry-run') === 'true';
const mode = core.getInput('mode');
const currentMajor = parseInt(core.getInput('current-major'));
const prefix = core.getInput('prefix');
const preRelease = core.getInput('pre-release');
const defaultBranch = core.getInput('default-branch');
const currentVersion = core.getInput('current-version');
const releaseBranch = core.getInput('release-branch');

main();

async function main() {
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  //console.log(`The event payload: ${payload}`);

  console.log(`Run action with mode ${mode}`);
  switch (mode) {
    case 'pre-release':
      if (checkPrereleaseRequirements(core, preRelease)) await runPreRelease();
      break;
    case 'release':
      await runRelease(releaseBranch);
      break;
    case 'release-branch':
      await runReleaseBranch(prefix);
      break;
    case 'fix':
      await runFix(prefix);
      break;
    case 'component-fix':
      await runComponentFix(prefix, currentVersion);
      break;
    case 'component-release':
      await runReleaseComponent(prefix);
      break;
    case 'component-get-last-version':
      const tag = await getLastComponentReleaseTag(prefix);
      core.setOutput('tag', tag.replace(prefix, ''));
      break;
  }
}

async function runComponentFix(prefix, currentVersion) {
  if (!currentVersion) {
    return core.setFailed('To run a fix you need to specify a currentVersion');
  }

  const regex = new RegExp(`^v(\\d+).(\\d+).(\\d+)$`, 'g');
  const matches = regex.exec(currentVersion);
  const major = parseInt(matches[1]);
  const minor = parseInt(matches[2]);
  const patch = parseInt(matches[3]);

  const fixTag = `${prefix}v${major}.${minor}.${patch + 1}`;
  if (!dryRun) await createTag(fixTag, github.context.payload.ref);

  core.setOutput('tag', fixTag);
  console.log(`🚀 New component fix '${fixTag}' created`);
}

async function runFix(prefix) {
  const releaseBranch = github.context.payload.workflow_run.head_branch;
  const releaseVersion = releaseBranch.replace(prefix, '');
  const tag = await getLastReleaseTagFromReleaseBranch(releaseVersion);
  if (!tag) {
    return core.setFailed('There are any release yet');
  }

  const regex = new RegExp(`^v(\\d+).(\\d+).(\\d+)$`, 'g');
  const matches = regex.exec(tag);
  const major = parseInt(matches[1]);
  const minor = parseInt(matches[2]);
  const patch = parseInt(matches[3]);

  const fixTag = `v${major}.${minor}.${patch + 1}`;
  if (!dryRun) {
    await createTag(fixTag, releaseBranch);
  }

  core.setOutput('tag', fixTag);
  console.log(`🚀 New fix '${fixTag}' created`);
}

async function runReleaseComponent(prefix) {
  const tag = await getLastComponentReleaseTag(prefix);
  if (!tag) return core.setFailed('There are not any component release yet');

  const regex = new RegExp(`^${prefix}v(\\d+).(\\d+)`, 'g');
  const matches = regex.exec(tag);
  const major = parseInt(matches[1]);
  const minor = parseInt(matches[2]);

  const releaseTag = `${prefix}v${major}.${minor + 1}.0`;

  if (!dryRun) {
    await createTag(releaseTag, defaultBranch);
  }

  console.log(`🚀 New release tag '${releaseTag}' created`);

  core.setOutput('tag', releaseTag);
}

async function runReleaseBranch(prefix) {
  const tag = await getLastPreReleaseTag();
  if (!tag) return core.setFailed('There are any pre-release yet');

  const regex = new RegExp(`^v(\\d+).(\\d+)`, 'g');
  const matches = regex.exec(tag);
  const major = parseInt(matches[1]);
  const minor = parseInt(matches[2]);

  const releaseBranch = `${prefix}${major}.${minor}`;
  if (!dryRun) {
    const created = await createBranch(releaseBranch, github.context.sha);

    if (!created) {
      return core.setFailed(
        `The release branch '${releaseBranch}' already exist`
      );
    }
  }

  console.log(`🚀 New release '${releaseBranch}' created`);
}

async function runRelease(releaseBranch) {
  const tag = await getLastPreReleaseTag();
  if (!tag) return core.setFailed('There are any pre-release yet');
  if (!releaseBranch)
    return core.setFailed('You need to specify the release branch to tag');

  console.log(`Create release tag in branch ${releaseBranch}`);

  const regex = new RegExp(`^v(\\d+).(\\d+)`, 'g');
  const matches = regex.exec(tag);
  const major = parseInt(matches[1]);
  const minor = parseInt(matches[2]);

  const releaseTag = `v${major}.${minor}.0`;
  if (!dryRun) {
    await createTag(releaseTag, releaseBranch);
  }

  console.log(`🚀 New release tag '${releaseTag}' created`);

  core.setOutput('tag', releaseTag);
}

function checkPrereleaseRequirements(core, preRelease) {
  if (preRelease === '') {
    core.setFailed('On mode pre-release the param preRelease is mandatory');
    return false;
  }
  return true;
}

async function runPreRelease() {
  let preReleaseTag;
  // TODO: (to implement) In case of increase a new major version check if the last alpha
  // has a current release.

  // TODO: Change calcPreReleaseBranch to getPreReleaseVersion
  let preReleaseBranch = await calcPreReleaseBranch(currentMajor, prefix);
  console.log('preReleaseBranch', preReleaseBranch);
  if (preRelease) {
    console.log('⚙️ Generating pre-release-tag');
    preReleaseTag = await calcPrereleaseTag(preReleaseBranch, preRelease);
  }

  if (!dryRun) createTag(preReleaseTag, defaultBranch);

  console.log(`🚀 New pre-release tag '${preReleaseTag}' created`);
  core.setOutput('tag', preReleaseTag);
}
