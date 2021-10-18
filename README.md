# Monorepo Tagger Action POC

This repository is a POC for using the action located at: https://github.com/marketplace/actions/action-monorepo-version-tags-lifecycle

## Structure

The repository holds a product with two components.

| | Description | Location |
| --- | --- | --- |
| product | Main application in python. | `app` folder |
| product deploy | Helm chart with two components. | `metaapp/` folder |
| component | Hello Component python app. | `hello-world/` folder |
| component | ByeBye Component python app. | `byebye-world/` folder |

## Workflows

There are one workflow for each component, one workflow for the product and another one to create release branches.

### Component Workflow

The workflow runs on:
 ```yaml
on:
  pull_request:
    branches:
      - main
      - "release/v*"
    paths:
      - "hello-world/**/*"
      - ".github/workflows/hello-*"
  push:
    branches:
      - main
      - "release/v*"
    paths:
      - "hello-world/**/*"
      - ".github/workflows/hello-*"
 ```

<table>
    <tr><td>Job</td><td>Description></td><td>Conditional on</td></tr>
    <tr>
        <td><pre>quality-checks</pre></td>
        <td>Run all quality checks for the component. Linter & Tests.</td>
        <td></td>
    </tr>
    <tr>
        <td><pre>create-release-tag</pre></td>
        <td>Creates a new tag for the component.</td>
        <td>
            <pre>
if: github.ref == 'refs/heads/main' # only in main branch
            </pre>
        </td>
    </tr>
    <tr>
        <td><pre>create-fix-tag</pre></td>
        <td>Creates a new tag for the component.</td>
        <td>
            <pre>
if: startsWith(github.ref, 'refs/heads/release') # only in release branches
            </pre>
        </td>
    </tr>
    <tr>
        <td><pre>build-release</pre></td>
        <td>Create a new build artifact for the component.</td>
        <td>
            <pre>
if: |
  always() &&
  (needs.create-release-tag.outputs.tag || needs.create-fix-tag.outputs.tag)
            </pre>
        </td>
    </tr>
</table>


### Product Workflow

The workflow runs on:
 ```yaml
on:
  workflow_run:
    workflows:
      - "Hello Component Build"
      - "ByeBye Component Build"
      - "App Application Build"
    types:
      - completed
 ```

<table>
    <tr><td>Job</td><td>Description></td><td>Conditional on</td></tr>
    <tr>
        <td><pre>[calculate|create]-rc-tag</pre></td>
        <td>Calculates or creates the next pre-release tag.</td>
        <td>
        <pre>
# Just after a workflow completes successfully and the workflows was triggered in main branch
if: |
  github.event.workflow_run.conclusion == 'success' &&
  github.event.workflow_run.head_branch == 'main'
        </pre>
        </td>
    </tr>
    <tr>
        <td><pre>[calculate|create]-fix-tag</pre></td>
        <td>Calculates or creates the next fix tag.</td>
        <td>
        <pre>
# Just after a workflow completes successfully and the workflows was triggered in a release branch
if: |
  github.event.workflow_run.conclusion == 'success' &&
  startsWith(github.event.workflow_run.head_branch, 'release')
        </pre>
        </td>
    </tr>
    <tr>
        <td><pre>release</pre></td>
        <td>Release a new version of the product Chart with new versions.</td>
        <td>
        <pre>
if: |
  always() &&
  (needs.calculate-rc-tag.outputs.tag || 
   needs.calculate-fix-tag.outputs.tag || 
   needs.calculate-release-tag.outputs.tag)
        </pre>
        </td>
    </tr>

</table>


### New Release Workflow

The workflow runs on:
 ```yaml
on:
  workflow_dispatch:
 ```

<table>
    <tr><td>Job</td><td>Description></td><td>Conditional on</td></tr>
    <tr>
        <td><pre>create-release-branch</pre></td>
        <td>Creates a new release branch.</td>
        <td></td>
    </tr>
    <tr>
        <td><pre>[calculate/create]-release-tag</pre></td>
        <td>Calculates the next release tag.</td>
        <td></td>
    </tr>
    <tr>
        <td><pre>release</pre></td>
        <td>Generates a new release of the chart.</td>
        <td></td>
    </tr>
</table>
