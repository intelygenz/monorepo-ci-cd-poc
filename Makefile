.DEFAULT_GOAL := help

# AutoDoc
# -------------------------------------------------------------------------
.PHONY: help
help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
.DEFAULT_GOAL := help


.PHONY: build-action
build-action: ## Build the github action
	cd .github/actions && ncc build src/index.js

.PHONY: act-release-component
act-release-component: ## Run Release component job
	act -j release-component -s GITHUB_TOKEN=token
