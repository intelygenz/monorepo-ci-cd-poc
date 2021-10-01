module.exports = function (octokit, owner, repo) {
  async function getAllBranchesNames() {
    let branchNames = [];
    let data_length = 0;
    let page = 0;
    do {
      const { data } = await octokit.repos.listBranches({
        owner,
        repo,
        per_page: 100,
        page,
      });
      const branchNamesPerPage = data.map((branch) => branch.name);
      data_length = branchNamesPerPage.length;
      branchNames.push(...branchNamesPerPage);
      page++;
    } while (data_length == 100);

    return branchNames.reverse();
  }

  /**
   * Calculates and return the version of the next pre-release based on existing release branches.
   *
   * Search for branches that matches with {releaseBranchPrefix}{currentMajor}.0 then:
   * - If there aren't any then the next release version is v{currentMajor}.0.
   * - If there are any, sum one to the greatest minor version
   *
   * @param currentMajor Current major version of the release cycle
   * @param releaseBranchPrefix The release branch refix (eg. release/)
   * @returns {Promise<string>}
   */
  async function calcPreReleaseVersionBasedOnReleaseBranches(currentMajor, releaseBranchPrefix) {
    const branches = await getAllBranchesNames();
    let major = currentMajor;
    let minor = 0;

    const regex = new RegExp(`^${releaseBranchPrefix}(\\d+).(\\d+)$`, 'g');

    // search for release branches with a greater major version, to return an error if any is found
    const greaterReleaseBranches = branches.filter((branchName) => {
      return branchName.match(`^${prefix}${major + 1}.[0-9]+$`);
    });
    if (greaterReleaseBranches.length > 0) {
      throw new Error('Branch with greater major version already exist');
    }

    // search for release branches with current major version
    const releaseBranchesForCurrentManjor = branches.filter((branchName) => {
      return branchName.match(`^${releaseBranchPrefix}${major}.[0-9]+$`);
    });

    // if no branches with the current major version is found, then the next pre-release cycle
    // is v${major}.${minor}
    if (releaseBranchesForCurrentManjor.length === 0) {
      return `v${major}.${minor}`;
    } else {
      // else take the greatest minor and sum one
      const releaseBranch = releaseBranchesForCurrentManjor[0];
      const matches = regex.exec(releaseBranch);
      major = parseInt(matches[1]);
      minor = parseInt(matches[2]);

      return `v${major}.${minor + 1}`;
    }
  }

  return {
    calcPreReleaseVersionBasedOnReleaseBranches,
  };
};
