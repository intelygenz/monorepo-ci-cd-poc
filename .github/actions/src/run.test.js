const core = require('@actions/core');
const github = require('@actions/github');

const { run } = require('./run');

jest.setTimeout(100000); // TODO: remove

describe('component', () => {
  test('create-release-tag', async () => {
    /* debug with real octokit object
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const [owner, repo] = 'intelygenz/monorepo-ci-cd-poc'.split('/');
    */

    const [owner, repo] = 'test-org/test-repo'.split('/');

    const octokitMock = {
      repos: {
        listTags: jest.fn().mockReturnValue({
          data: [
            { name: 'v0.3.0' },
            { name: 'v0.2.0' },
            { name: 'hello-v0.99.0' },
            { name: 'hello-v0.98.0' },
            { name: 'hello-v0.97.0' },
          ],
        }),
        getBranch: jest.fn().mockReturnValue({
          data: {
            name: 'main',
            commit: {
              sha: 'sha1234',
            },
          },
        }),
      },
      git: {
        createTag: jest.fn().mockReturnValue({ data: { sha: 'sha5678' } }),
        createRef: jest.fn().mockReturnValue({ data: { sha: 'ref12345' } }),
      },
    };

    core.setOutput = jest.fn();
    core.setFailed = jest.fn();

    const params = {
      componentPrefix: 'hello-',
      releaseBranchPrefix: '',
      mode: 'component',
      type: 'final',
      dryRun: false,
      defaultBranch: 'main',
      currentVersion: 'v0.0.0',
      currentMajor: 0,
      preReleaseName: '',
    };

    await run(octokitMock, owner, repo, params);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'hello-v0.100.0');
  });

  test('calculate-rc-tag', async () => {
    /*
    // debug with real octokit object
    const octokitMock = github.getOctokit(process.env.GITHUB_TOKEN);
    const [owner, repo] = 'intelygenz/monorepo-ci-cd-poc'.split('/');

    */
    const [owner, repo] = 'test-org/test-repo'.split('/');
    const octokitMock = {
      repos: {
        listBranches: jest.fn().mockReturnValue({
          data: [{ name: 'main' }, { name: 'release/v0.22' }, { name: 'release/v0.23' }],
        }),
        listTags: jest.fn().mockReturnValue({
          data: [
            { name: 'v0.3.0' },
            { name: 'v0.2.0' },
            { name: 'hello-v0.99.0' },
            { name: 'hello-v0.98.0' },
            { name: 'hello-v0.97.0' },
          ],
        }),
        getBranch: jest.fn().mockReturnValue({
          data: {
            name: 'main',
            commit: {
              sha: 'sha1234',
            },
          },
        }),
      },
      git: {
        createTag: jest.fn().mockReturnValue({ data: { sha: 'sha5678' } }),
        createRef: jest.fn().mockReturnValue({ data: { sha: 'ref12345' } }),
      },
    };

    core.setOutput = jest.fn();
    core.setFailed = jest.fn();

    const params = {
      componentPrefix: '',
      releaseBranchPrefix: 'release/v',
      mode: 'product',
      type: 'pre-release',
      dryRun: true,
      defaultBranch: 'main',
      currentVersion: 'v0.0.0',
      currentMajor: '0',
      preReleaseName: 'rc',
    };

    await run(octokitMock, owner, repo, params);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'v0.24-rc.0');
  });

  test('release (query component-last-tag)', async () => {
    /*
    // debug with real octokit object
    const octokitMock = github.getOctokit(process.env.GITHUB_TOKEN);
    const [owner, repo] = 'intelygenz/monorepo-ci-cd-poc'.split('/');

    */
    const [owner, repo] = 'test-org/test-repo'.split('/');
    const octokitMock = {
      repos: {
        listBranches: jest.fn().mockReturnValue({
          data: [{ name: 'main' }, { name: 'release/v0.22' }, { name: 'release/v0.23' }],
        }),
        listTags: jest.fn().mockReturnValue({
          data: [
            { name: 'v0.3.0' },
            { name: 'v0.2.0' },
            { name: 'hello-v0.99.0' },
            { name: 'hello-v0.98.0' },
            { name: 'hello-v0.97.0' },
          ],
        }),
        getBranch: jest.fn().mockReturnValue({
          data: {
            name: 'main',
            commit: {
              sha: 'sha1234',
            },
          },
        }),
      },
    };

    core.setOutput = jest.fn();
    core.setFailed = jest.fn();

    const params = {
      componentPrefix: 'hello-',
      releaseBranchPrefix: '',
      mode: 'query',
      type: 'component-last-version',
      dryRun: false,
      defaultBranch: 'main',
      currentVersion: 'v0.0.0',
      currentMajor: '0',
      preReleaseName: '',
    };

    await run(octokitMock, owner, repo, params);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'hello-v0.99.0');
  });

  test('create-rc-tag', async () => {
    /*
    // debug with real octokit object
    const octokitMock = github.getOctokit(process.env.GITHUB_TOKEN);
    const [owner, repo] = 'intelygenz/monorepo-ci-cd-poc'.split('/');

    */
    const [owner, repo] = 'test-org/test-repo'.split('/');
    const octokitMock = {
      repos: {
        listBranches: jest.fn().mockReturnValue({
          data: [{ name: 'main' }, { name: 'release/v0.22' }, { name: 'release/v0.23' }],
        }),
        listTags: jest.fn().mockReturnValue({
          data: [
            { name: 'v0.3.0' },
            { name: 'v0.2.0' },
            { name: 'hello-v0.99.0' },
            { name: 'hello-v0.98.0' },
            { name: 'hello-v0.97.0' },
          ],
        }),
        getBranch: jest.fn().mockReturnValue({
          data: {
            name: 'main',
            commit: {
              sha: 'sha1234',
            },
          },
        }),
      },
      git: {
        createTag: jest.fn().mockReturnValue({ data: { sha: 'sha5678' } }),
        createRef: jest.fn().mockReturnValue({ data: { sha: 'ref12345' } }),
      },
    };

    core.setOutput = jest.fn();
    core.setFailed = jest.fn();

    const params = {
      componentPrefix: '',
      releaseBranchPrefix: 'release/v',
      mode: 'product',
      type: 'pre-release',
      dryRun: false,
      defaultBranch: 'main',
      currentVersion: 'v0.0.0',
      currentMajor: '0',
      preReleaseName: 'rc',
    };

    await run(octokitMock, owner, repo, params);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'v0.24-rc.0');
  });

  test('generate-prerelease', async () => {
    /*
    // debug with real octokit object
    const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
    const [owner, repo] = 'intelygenz/monorepo-ci-cd-poc'.split('/');
    */
    const [owner, repo] = 'test-org/test-repo'.split('/');

    const octokitMock = {
      repos: {
        listTags: jest.fn().mockReturnValue({
          data: [
            { name: 'v0.4-rc.1' },
            { name: 'v0.3.0' },
            { name: 'v0.2.0' },
            { name: 'hello-v0.99.0' },
            { name: 'hello-v0.98.0' },
            { name: 'hello-v0.97.0' },
          ],
        }),
        getBranch: jest.fn().mockReturnValue({
          data: {
            name: 'main',
            commit: {
              sha: 'sha1234',
            },
          },
        }),
      },
      git: {
        createRef: jest.fn().mockReturnValue({ data: { sha: 'ref12345' } }),
      },
    };

    core.setOutput = jest.fn();
    core.setFailed = jest.fn();

    const params = {
      componentPrefix: '',
      releaseBranchPrefix: 'release/v',
      mode: 'product',
      type: 'new-release-branch',
      dryRun: false,
      defaultBranch: 'main',
      currentVersion: 'v0.0.0',
      currentMajor: 0,
      preReleaseName: '',
    };

    await run(octokitMock, owner, repo, params);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'release/v0.4');
  });

  test('create-fix-tag', async () => {
    // debug with real octokit object
    //const octokitMock = github.getOctokit(process.env.GITHUB_TOKEN);
    //const [owner, repo] = 'intelygenz/monorepo-ci-cd-poc'.split('/');

    const [owner, repo] = 'test-org/test-repo'.split('/');

    const octokitMock = {
      repos: {
        listTags: jest.fn().mockReturnValue({
          data: [
            { name: 'v0.3.0' },
            { name: 'v0.2.0' },
            { name: 'hello-v0.99.0' },
            { name: 'hello-v0.98.0' },
            { name: 'hello-v0.97.0' },
          ],
        }),
        getBranch: jest.fn().mockReturnValue({
          data: {
            name: 'release/v0.22',
            commit: {
              sha: 'sha1234',
            },
          },
        }),
      },
      git: {
        createTag: jest.fn().mockReturnValue({ data: { sha: 'sha5678' } }),
        createRef: jest.fn().mockReturnValue({ data: { sha: 'ref12345' } }),
      },
    };

    core.setOutput = jest.fn();
    core.setFailed = jest.fn();

    const params = {
      componentPrefix: 'hello-',
      releaseBranchPrefix: '',
      mode: 'component',
      type: 'fix',
      dryRun: false,
      defaultBranch: 'main',
      currentVersion: 'v0.98.0',
      currentMajor: 0,
      preReleaseName: '',
    };

    github.context.payload = {
      workflow_run: { head_branch: 'release/v0.22' },
    };

    await run(octokitMock, owner, repo, params);

    expect(core.setFailed).toHaveBeenCalledTimes(0);
    expect(core.setOutput).toHaveBeenCalledTimes(1);
    expect(core.setOutput).toHaveBeenCalledWith('tag', 'hello-v0.98.1');
    expect(octokitMock.repos.getBranch).toHaveBeenCalledWith({
      branch: 'release/v0.22',
      owner: 'test-org',
      repo: 'test-repo',
    });
  });
});
