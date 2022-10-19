#!/bin/bash

# ref: https://github.com/mjhea0/cypress-visual-regression

set -e

echo "Generate baseline images"
cd /e2e/

npm ci

unset NODE_OPTIONS
cypress run  --headless --env type=base --config screenshotsFolder=cypress/snapshots/base,testFiles=\"**/screenshots*.js\"