const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const core = require('@actions/core');
const { exec } = require('@actions/exec');


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

    const versionFiles = JSON.parse(updateVersionsIn);
    let updatedContent;

    for (file in versionFiles) {
      // only yml files
      if (!file.file.endsWith('.yml') && !file.file.endsWith('.yaml')) {
        core.error(`Only yml files are valid to update the version.`);
        continue;
      }

      const yml = getFileAsUTF8(file.file);
      const ymlObj = JSON.parse(yml);
      core.debug(`Parsed JSON: ${JSON.stringify(ymlObj)}`);

      // update the object property with the version
      lodash.update(ymlObj, property, () => version);

      // write to actual file
      writeToFile(JSON.stringify(ymlObj), filePath);
    }

    // commit the files
    return await commitFile(branch, commitMessage, author, authorEmail);
  }

  async function commitFile (branch, commitMessage, authorName, authorEmail) {
    let sha;
    await exec('git', [ 'checkout', branch ]);
    await exec('git', [ 'add', '-A' ])
    await exec('git', [ 'config', '--local', 'user.name', authorName ])
    await exec('git', [ 'config', '--local', 'user.email', authorEmail ])
    await exec('git', [ 'commit', '--no-verify', '-m', commitMessage ])
    await exec('git', [ 'rev-parse', 'HEAD' ], { listeners: { stdout: buffer => sha += buffer.toString() }})
    return sha;
  }

  // Notice that readFile's utf8 is typed differently from Github's utf-8
  function getFileAsUTF8(filePath) {
    const absolutePath = path.join(process.cwd(), filePath);
    core.debug(`FilePath: ${absolutePath}`);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`could not parse file with path: ${absolutePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  }

  function writeToFile(yamlString, filePath) {
    fs.writeFile(filePath, yamlString, err => {
      if (err) {
        core.warning(err.message)
        throw err;
      }
    })
  }

  return {
    updateVersionInFileAndCommit,
  };
};
