#!/bin/bash
set -e

echo "# Update Cypress dependencies"
./docker-compose build cypress --build-arg USER_ID=`id -u` --build-arg GROUP_ID=`id -g`
./docker-compose run --workdir=/e2e/cypress cypress npm install cypress-visual-regression --save-dev --legacy-peer-deps

