const updaterMod = require('./version-file-updater');
const fs = require('fs');
const actions = require('@actions/exec');

describe('update file with version', () => {

  fs.writeFile = jest.fn();
  actions.exec = jest.fn();

  const version = 'v3.4';
  const branch = 'main';
  const commitMessage = 'test commit message';
  const author = "author";
  const authorEmail = "author@email.com";

  test('two writes for an array of two files', async () => {
    const updater = updaterMod();
    const files = '[{"file": "metaapp/values.yaml", "property": "app.tag"}, {"file": "metaapp/Chart.yaml", "property": "appVersion"}]'
    await updater.updateVersionInFileAndCommit(files, version, branch, commitMessage, author, authorEmail)

    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(actions.exec).toHaveBeenCalledTimes(5);
  });

});
