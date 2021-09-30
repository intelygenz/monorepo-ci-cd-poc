const tagsMod = require('./tags.js');

describe('get component last tag', () => {
  const listTagMock = jest.fn().mockReturnValue({
    data: [{ name: 'component1-last-tag' }, { name: 'component1-another-tag' }],
  });
  const octokit = {
    repos: {
      listTags: listTagMock,
    },
  };
  const owner = 'test';
  const repo = 'test';

  test('find last', async () => {
    const tags = tagsMod(octokit, owner, repo);
    const res = await tags.getLastComponentReleaseTag('component1');

    expect(res).toBe('component1-last-tag');
  });

  test('wrong component tag', async () => {
    const tags = tagsMod(octokit, owner, repo);
    const res = await tags.getLastComponentReleaseTag('unknown-component');

    expect(res).toBeNull();
  });
});
