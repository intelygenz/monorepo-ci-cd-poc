module.exports = function (octokit, owner, repo) {
  async function getLastComponentReleaseTag(prefix) {
    return getLastTag(`^${prefix}`);
  }

  async function getLastTag(regex) {
    const tagNames = await searchTagNames(octokit, owner, repo);
    const tagsWithComponent = tagNames.filter((tagName) => {
      return tagName.match(regex);
    });
    if (tagsWithComponent.length !== 0) {
      return tagsWithComponent[0];
    }

    return null;
  }

  async function searchTagNames() {
    let tagNames = [];
    let data_length = 0;
    let page = 0;
    do {
      const { data } = await octokit.repos.listTags({
        owner,
        repo,
        per_page: 100,
        page,
      });
      const tagNamesPerPage = data.map((tag) => tag.name);
      data_length = tagNamesPerPage.length;
      tagNames.push(...tagNamesPerPage);
      page++;
    } while (data_length === 100);

    return tagNames;
  }

  return {
    getLastComponentReleaseTag,
  };
};
