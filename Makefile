# hack to get osx to recognize a change in PATH
SHELL := /usr/bin/env sh
PATH := $(shell pwd)/node_modules/.bin:${PATH}

# Make Settings

.SECONDEXPANSION:
.SECONDARY:
.SUFFIXES:


# Vars

test_command := mocha test --require=test/index --recursive


# Files

lib_files := $(shell find lib -type f -name *.js)
lib_asset_files := $(shell find lib -type f ! -name "*.js" ! -name "*.js.flow" ! -name ".eslintrc.*" ! -name "*.orig")

build_files := $(lib_files:lib/%=build/%)
build_asset_files := $(lib_asset_files:lib/%=build/%)
build_package_files := build/README.md build/package.json build/license build/.npmignore


# Build

all: build

node_modules: package.json
	npm install
	@touch $@

${build_files}: $$(patsubst build/%,lib/%,$$@) node_modules
	@mkdir -p $(dir $@)
	babel $< --out-file $@ --source-maps

${build_asset_files}: $$(patsubst build/%,lib/%,$$@)
	@mkdir -p $(dir $@)
	cp $< $@

${build_package_files}: $$(notdir $$@) node_modules
	@mkdir -p $(dir $@)
	cp $< $@

build: node_modules ${build_files} ${build_asset_files} ${build_package_files}
	@touch $@


# Tasks

full-test: lint flow test cover

flow:
	flow

flow-stop:
	flow stop

lint:
	eslint lib

test: build
	cd build && ${test_command}

cover: node_modules
	cd lib && BABEL_ENV=cover nyc ${test_command}
	mv lib/coverage .

clean:
	rm -rf build .nyc_output

maintainer-clean: clean
	rm -rf node_modules coverage


.PHONY: all full-test flow flow-stop lint test cover clean maintainer-clean
