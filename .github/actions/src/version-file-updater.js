const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const lodash = require('lodash');
const core = require('@actions/core');
const actions = require('@actions/exec');

module.exports = function () {
  /**
   * Updates file contents and commit the changes.
   *
   * @param files Array with files and properties to be updated [{file: 'filename.yml', property: 'myProp.path'}]
   * @param version The new version for the property
   * @param branch The branch to make the changes
   * @returns sha The commit SHA that was made with the version update
   */
  async function updateVersionInFileAndCommit(files, version, branch, commitMessage, author, authorEmail) {
    const versionFiles = JSON.parse(files);
    console.log('parsed files are ', versionFiles);

    let updatedContent;
    let filesUpdated = 0;

    versionFiles.forEach((file) => {
      console.log('file ', file);
      // only yml files
      if (!file.file.endsWith('.yml') && !file.file.endsWith('.yaml')) {
        console.log(`Only yml files are valid to update the version.`);
        return;
      }

      const filePath = path.join(process.cwd(), file.file)
      const ymlObj = yaml.load(fs.readFileSync(filePath, 'utf8'));
      console.log(`YML file ${filePath} contents: ${JSON.stringify(ymlObj)}`);

      // update the object property with the version
      lodash.update(ymlObj, file.property, () => version);

      // write to actual file
      writeToFile(yaml.dump(ymlObj), file.file);
      filesUpdated++;
    });

    // commit the files
    if (filesUpdated > 0) {
      return await commitChanges(branch, commitMessage, author, authorEmail);
    }
  }

  async function commitChanges(branch, commitMessage, authorName, authorEmail) {
    await actions.exec('git', ['checkout', branch]);
    await actions.exec('git', ['add', '-A']);
    await actions.exec('git', ['config', '--local', 'user.name', authorName]);
    await actions.exec('git', ['config', '--local', 'user.email', authorEmail]);
    await actions.exec('git', ['commit', '--no-verify', '-m', commitMessage]);
    await actions.exec('git', ['push']);
  }

  function writeToFile(yamlString, filePath) {
    fs.writeFile(filePath, yamlString, (err) => {
      if (err) {
        console.log(err.message);
        throw err;
      }
    });
  }

  return {
    updateVersionInFileAndCommit,
  };
};
