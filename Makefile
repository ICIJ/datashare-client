.PHONY: help install dev storybook build preview lint lint-modified lint-fix test test-unit test-unit-watch doc doc-api doc-hooks doc-widgets doc-storybook doc-title clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	yarn install --frozen-lockfile

dev: ## Start dev server
	yarn serve

storybook: ## Start Storybook dev server
	yarn storybook

build: ## Build the project
	yarn build

preview: ## Preview the built site
	yarn preview

lint: ## Run ESLint across all files
	yarn lint

lint-modified: ## Run ESLint on modified files
	yarn lint:modified

lint-fix: ## Run ESLint with auto-fix
	yarn lint:fix

test: ## Run all tests once
	yarn test

test-unit: ## Run all unit tests once
	yarn test:unit

test-unit-watch: ## Run unit tests in watch mode
	yarn test:unit:watch

doc: ## Generate all documentation
	yarn doc

doc-api: ## Generate API reference documentation
	yarn doc:api

doc-hooks: ## Generate hooks documentation
	yarn doc:hooks

doc-widgets: ## Generate widgets documentation
	yarn doc:widgets

doc-storybook: ## Build Storybook static site
	yarn doc:storybook

doc-title: ## Patch Storybook static index title
	yarn doc:title

clean: ## Remove build artifacts and node_modules
	rm -rf node_modules dist
