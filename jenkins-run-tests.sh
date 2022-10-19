#!/bin/bash
set -e

echo "Run Cypress functional tests against the production site"

docker build --build-arg USER_ID=`id -u` --build-arg GROUP_ID=`id -g` cypress/. -t cypress-test-suite
docker run --add-host climatearchive.org:172.27.5.19 -v "`pwd`":/e2e -w /e2e -e CYPRESS_baseUrl=https://climatearchive.org/ -e INCLUDE_SCREENSHOT_TESTS=False -e NO_COLOR=1 --rm cypress-test-suite
