# Common variables
VERSION := 0.7.0

# Things you don't want to change
REPO_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
# Tools
SERVER_PATH := $(REPO_DIR)/tools/node_modules/.bin/http-server
PRETTIER_PATH := $(REPO_DIR)/tools/node_modules/.bin/prettier

.PHONY: help image push build run lint lint-fix
.DEFAULT_GOAL := help

help: ## 💬 This help message :)
	@figlet $@ || true
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install-tools: ## 🔮 Install dev tools into project tools directory
	@figlet $@ || true
	@$(SERVER_PATH) -v > /dev/null 2>&1 || npm install --prefix ./tools http-server
	@$(PRETTIER_PATH) -v > /dev/null 2>&1 || npm install --prefix ./tools prettier
	
lint: ## 🌟 Lint & format, will not fix but sets exit code on error
	@figlet $@ || true
	@$(PRETTIER_PATH) --check js/*.mjs css/*.css index.html

lint-fix: ## 🔍 Lint & format, will try to fix errors and modify code
	@figlet $@ || true
	@$(PRETTIER_PATH) --write js/*.mjs css/*.css index.html

serve: ## 🌐 Start a local HTTP server for development
	@figlet $@ || true
	@echo "🌐 Starting local HTTP server on http://localhost:8080/"
	@$(SERVER_PATH) -c-1 -s -o