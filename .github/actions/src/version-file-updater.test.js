const updaterMod = require('./version-file-updater');
const fs = require('fs');

describe('update file with version', () => {

  jest.mock('fs');

  const version = 'v3.4';
  const branch = 'main';
  const commitMessage = 'test commit message';
  const author = "author";
  const authorEmail = "author@email.com";

  test('find last', async () => {
    const updater = updaterMod();
    const files = '[{"file": "metaapp/values.yaml", "property": "app.tag"}, {"file": "metaapp/Chart.yaml", "property": "appVersion"}]'
    updater.updateVersionInFileAndCommit(files, version, branch, commitMessage, author, authorEmail)

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
  });

});
