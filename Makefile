# Makefile
# load and export .env
ifneq (,$(wildcard ./.env))
  include .env
  export
endif

init:
	npm install wrangler --save-dev
	npx wrangler --version
	npm create cloudflare\@2 -- app-artfy-you
	pip install -r requirements.txt
.PHONY: init

translate:
	python3 translate.py
.PHONY: translate

deploy: translate
	cd api-server && npx wrangler deploy
.PHONY: deploy

dev:
	cd api-server && npm run dev
.PHONY: dev
