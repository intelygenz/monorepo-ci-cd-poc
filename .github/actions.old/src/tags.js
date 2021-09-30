module.exports = function(octokit, owner, repo) {
    async function searchLastTags() {   
        try {
            const { data: tags } = await octokit.repos.listTags({
                owner,
                repo,
                per_page: 100,
            });

            return tags
        } catch (err) {
            throw err
        }
    }

    async function existsCommitInLastTags(sha){
        try {
            const tags = await searchLastTags()
            filterTags = tags.filter( tag => tag.commit.sha === sha)
            if(filterTags.length === 0) return false
            return true
        } catch (error) {
            throw err
        }
    }

    async function searchTagNames() {
        let tagNames = []
        let data_length = 0
        let page = 0;
        try {
          do {
            const { data } = await octokit.repos.listTags({
              owner,
              repo,
              per_page: 100,
              page
            });
            const tagNamesPerPage = data.map(tag => tag.name)
            data_length = tagNamesPerPage.length
            tagNames.push(...tagNamesPerPage)
            page++
          } while (data_length == 100)
        } catch (err) {
            throw err
        }
      
        return tagNames
    }

    async function getLastTag(regex) {
        try {
            const tagNames = await searchTagNames(octokit, owner, repo)
            const tagsWithComponent = tagNames.filter(tagName => tagName.match(regex))
            if (tagsWithComponent.length !== 0) return tagsWithComponent[0]
            return null
        } catch (err) {
            throw err
        }
    }

    async function getLastComponentReleaseTag(prefix) {
        return getLastTag(`^${prefix}`)
    }

    async function getLastPreReleaseTag() {
        return getLastTag(`^v[0-9]+.[0-9]+-`)
    }

    async function getLastReleaseTagFromReleaseBranch(releaseVersion) {
        const tagNames = await searchTagNames(octokit, owner, repo)
        const tagsWithPrefix = tagNames.filter(tagName => tagName.match(`^v${releaseVersion}.[0-9]+$`))
        if (tagsWithPrefix.length !== 0) {
          return tagsWithPrefix[0]
        }
        return null
    }
      
    async function calcPrereleaseTag(release, preRelease) {
        const tagNames = await searchTagNames(octokit, owner, repo)
        const tagsWithPrefix = tagNames.filter(tagName => tagName.match(`^${release}-${preRelease}`))

        if(tagsWithPrefix.length === 0) return `${release}-${preRelease}.0`
        const regex = new RegExp(`^${release}-${preRelease}.(\\d+)$`, 'g')
        const releaseTag = tagsWithPrefix[0]

        const matches = regex.exec(releaseTag)
        bumpVersion = parseInt(matches[1]);
        return `${release}-${preRelease}.${bumpVersion+1}`
    }
      
    async function createTag(tagName, defaultBranch) {
        console.log("Creating tag")
        const { data:branchData } = await octokit.repos.getBranch({
            owner,
            repo,
            branch: defaultBranch
        });
        const mainBranchSHA = branchData.commit.sha
        const { data:tagData } = await octokit.git.createTag({
            owner,
            repo,
            tag: tagName,
            message: `Release ${tagName}`,
            object: mainBranchSHA,
            type: "commit"
        });
        const { data:createTagData } = await octokit.git.createRef({
            owner,
            repo,
            ref: `refs/tags/${tagName}`,
            sha: tagData.sha,
            object: mainBranchSHA,
            type: "commit"
        });
        console.log("Tag ref created: ",createTagData.ref)
    }

  return {
    existsCommitInLastTags,
    calcPrereleaseTag,
    getLastPreReleaseTag,
    getLastComponentReleaseTag,
    getLastReleaseTagFromReleaseBranch,
    createTag
  }
}
