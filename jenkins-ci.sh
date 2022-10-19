#!/bin/bash
set -e

echo "In working directory"
pwd

echo "Report on git status"
git status

echo "Report on git log"
git log

echo "Using Docker version"
docker -v

echo "Build local Docker image"
docker build -t npm .

echo "Generate static files"
docker run \
    --entrypoint="" \
    --name climate-archive-app \
    npm \
    npm run build

docker cp climate-archive-app:/var/src/dist dist
docker stop climate-archive-app && docker rm climate-archive-app

echo "Copy .htaccess to expected location"
cp .htaccess dist/

echo "Generated these files"
ls dist/

echo "Deploy to static site in first instance (manual after code review) to /usr/local/projects/web-static/WWW/climatearchive on web-static-p0.rit.bris.ac.uk"
rsync -v --delete -e "ssh -o StrictHostKeyChecking=no" -r dist/  web-static@web-static-p0.rit.bris.ac.uk:/usr/local/projects/web-static/WWW/climatearchive/
