#!/bin/bash
set -e

echo "# Run Cypress tests"

echo " * Download docker-compose"
curl -L --fail "https://github.com/docker/compose/releases/download/v2.10.2/docker-compose-$(uname -s)-$(uname -m)" -o docker-compose
chmod +x docker-compose
./docker-compose -v
echo " * Ensure any old failing builds have been cleaned up properly"
./docker-compose down
echo " * Bring up docker compose development environment and run Cypress tests"
./docker-compose build --build-arg USER_ID=`id -u` --build-arg GROUP_ID=`id -g`
./docker-compose up --exit-code-from cypress
./docker-compose down