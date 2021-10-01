const componentsMod = require('./components');
const { TYPE_FIX, TYPE_FINAL } = require('./types');

describe('components module', () => {
  const tags = {
    createComponentFixTag: jest.fn(),
    createComponentFinalTag: jest.fn(),
    getLastComponentReleaseTag: jest.fn(),
  };

  test('createComponentTag FIX', async () => {
    const components = componentsMod(tags);

    const prefix = 'test-component';
    const type = TYPE_FIX;
    const version = 'v1.0.0';
    const branch = 'main';

    tags.createComponentFixTag.mockReturnValue('v1.0.1');

    const tag = await components.createComponentTag({ prefix, type, version, branch });

    expect(tag).toBe('v1.0.1');
    expect(tags.createComponentFixTag).toHaveBeenCalledTimes(1);
    expect(tags.createComponentFixTag).toHaveBeenCalledWith(prefix, version, branch, undefined);
  });

  test('createComponentTag FINAL', async () => {
    const components = componentsMod(tags);

    const prefix = 'test-component';
    const type = TYPE_FINAL;
    const branch = 'main';

    tags.createComponentFinalTag.mockReturnValue('v1.1.0');
    tags.getLastComponentReleaseTag.mockReturnValue('v1.0.0');

    const tag = await components.createComponentTag({ prefix, type, branch });

    expect(tag).toBe('v1.1.0');
    expect(tags.getLastComponentReleaseTag).toHaveBeenCalledTimes(1);
    expect(tags.getLastComponentReleaseTag).toHaveBeenCalledWith(prefix);
    expect(tags.createComponentFixTag).toHaveBeenCalledTimes(1);
    expect(tags.createComponentFixTag).toHaveBeenCalledWith(prefix, 'v1.0.0', branch, undefined);
  });
});
