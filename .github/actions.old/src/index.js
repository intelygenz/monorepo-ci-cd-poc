const core = require('@actions/core')
const github = require('@actions/github');

// Initialize Octokit
const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/")


// Input variables
const dryRun =  core.getInput('dry-run') == "true" ? true : false
const prefix = core.getInput('prefix')
const type =  core.getInput('type')
const mode =  core.getInput('mode')


const {
  getLastComponentReleaseTag
} = require('./tags')(octokit, owner, repo)

run()

async function run() {

  console.log(`Run action with mode ${mode}`)
  switch(mode){
    case 'component':
      const tag = tagComponent(prefix, type, dryRun)
      if(!tag) return core.setFailed('There are not any component release yet')

      break
  }
}


async function tagComponent(prefix, type, dryRun) {
  const tag = await getLastComponentReleaseTag(prefix)
  const {major, minor} = parseVersion(tag)
  const releaseTag = `${prefix}v${major}.${minor + 1}.0`

  if (!dryRun) {
    await createTag(releaseTag, defaultBranch)
  }

  return releaseTag
}


function parseVersion(tag) {

  const regex = new RegExp(`^v(\\d+).(\\d+).(\\d+)$`, 'g')
  const matches = regex.exec(tag)
  const major = parseInt(matches[1]);
  const minor = parseInt(matches[2]);
  const patch = parseInt(matches[3]);


  return {major, minor,  patch}
}
