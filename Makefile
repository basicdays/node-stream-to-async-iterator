# Make Settings

.SECONDEXPANSION:
.SECONDARY:
.SUFFIXES:


# Vars

pwd := $(shell pwd)
PATH := ${pwd}/node_modules/.bin:${PATH}
test_command := mocha test --require=test/index --recursive


# Files

lib_files := $(shell find lib -type f -name *.js)
lib_asset_files := $(shell find lib -type f ! -name "*.js" ! -name ".eslintrc.*" ! -name "*.orig")

build_files := $(lib_files:lib/%=build/%)
build_asset_files := $(lib_asset_files:lib/%=build/%)
build_package_files := build/README.md build/package.json


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

full-test: lint test cover

lint:
	eslint lib

test: build
	cd build && ${test_command}

cover: node_modules
	cd lib && BABEL_ENV=cover nyc ${test_command}

clean:
	rm -rf build .nyc_output

maintainer-clean: clean
	rm -rf node_modules


.PHONY: all lint test cover clean maintainer-clean
