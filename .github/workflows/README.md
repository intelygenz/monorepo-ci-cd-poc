# Workflows

These workflows are responsible for generating tags and new release branches. The flow is as follows:

1. Push changes to `main` branch
2. The quality workflow for the component that was changed is triggered
3. A component is tagged on successfully completed quality workflows
4. A component is built on component tag creation
5. The helm chart is updated with new pre-release version and component versions on successfully completed 
component built workflows
6. A new final release for the helm chart can be manually triggered (new branch + final tag is created)
7. The helm chart is released on final tags