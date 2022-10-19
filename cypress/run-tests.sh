#!/bin/bash
set -e

echo "Install cypress plugins"
npm ci

echo "Run cypress tests"
if [ $INCLUDE_SCREENSHOT_TESTS = "True" ];
then
    echo "Run screenshot Cypress tests in Electron"
    # Attempt to bug fix Electron hanging
    unset NODE_OPTIONS
    cypress run --env type=actual --spec=integration/screenshots*.js --headless
fi

if [ $INCLUDE_FUNCTIONAL_TESTS = "True" ];
then
    echo "Run functional Cypress tests in Chrome"
    cypress run --browser chrome --config excludeSpecPattern=integration/screenshots*.js
fi