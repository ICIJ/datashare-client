.PHONY: help install dev build preview lint lint-fix test test-unit doc clean

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	yarn install --frozen-lockfile

dev: ## Start dev server
	yarn serve

build: ## Build the project
	yarn build

preview: ## Preview the built site
	yarn preview

lint: ## Run ESLint across all files
	yarn lint

lint-fix: ## Run ESLint with auto-fix
	yarn lint:fix

test: ## Run all tests in watch mode
	yarn test

test-unit: ## Run all tests once
	yarn test:unit

doc: ## Generate documentation
	yarn doc

clean: ## Remove build artifacts and node_modules
	rm -rf node_modules dist
