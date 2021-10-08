const componentsMod = require('./components');
const { TYPE_FIX, TYPE_FINAL } = require('./types');
const github = require('@actions/github');

describe('components module', () => {
  const tags = {
    createComponentFixTag: jest.fn(),
    createComponentFinalTag: jest.fn(),
    getLastComponentReleaseTag: jest.fn(),
  };

  test('createComponentTag FIX', async () => {
    const components = componentsMod(tags);

    const prefix = 'test-component-';
    const type = TYPE_FIX;
    const version = 'test-component-v1.0.0';
    const branch = 'release/v0.1';
    github.context.payload = {
      ref: 'refs/heads/release/v0.1',
    };
    tags.createComponentFixTag.mockReturnValue('v1.0.1');

    const tag = await components.createComponentTag({ prefix, type, version, branch, dryRun: false });

    expect(tag).toBe('v1.0.1');
    expect(tags.createComponentFixTag).toHaveBeenCalledTimes(1);
    expect(tags.createComponentFixTag).toHaveBeenCalledWith(prefix, 'v1.0.0', branch, false);
  });

  test('createComponentTag FINAL', async () => {
    const components = componentsMod(tags);

    const prefix = 'test-component-';
    const type = TYPE_FINAL;
    const branch = 'main';
    const dryRun = false;

    tags.createComponentFinalTag.mockReturnValue('v1.1.0');
    tags.getLastComponentReleaseTag.mockReturnValue('v1.0.0');

    const tag = await components.createComponentTag({ prefix, type, branch, dryRun });

    expect(tag).toBe('v1.1.0');
    expect(tags.getLastComponentReleaseTag).toHaveBeenCalledTimes(1);
    expect(tags.getLastComponentReleaseTag).toHaveBeenCalledWith(prefix);
    expect(tags.createComponentFinalTag).toHaveBeenCalledTimes(1);
    expect(tags.createComponentFinalTag).toHaveBeenCalledWith(prefix, branch, 'v1.0.0', false);
  });
});
