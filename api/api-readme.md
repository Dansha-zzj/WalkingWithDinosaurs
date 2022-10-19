# API

[![Docker build and test](https://github.com/sebsteinig/climate-archive/actions/workflows/docker.yml/badge.svg)](https://github.com/sebsteinig/climate-archive/actions/workflows/docker.yml)

## About

A sample separate back end app to provide a search interface between the climate app fron end visualisation and extracting specific information from a set of netCDF files.

A solution will be developed as a Docker contained service and deployed to Azure.

A Python base docker image is being extended to build upon the netCDF package to provide a light weight REST API using Flask.

In the first instance a proof of concept will be built.  

### Tasks for the proof of concept
1. Set up development Docker env
1. Install necessary Python packages
1. TODO: Create method to read a parameter from one netCDF file
1. Add Flask wrapper
1. TODO: Add tests

### Further development

1. Create a docker-compose development environment to integrate development and testing of front and back end.
1. Further investigate scaling of proposed solution
1. Review alternative approaches

## Development

Build the docker image and call it climate-app-python

### Rebuilt base image

NB: Should be run from the root of the repository
```bash
docker build -t climate-app-python . -f api/Dockerfile
```

### Run container

```bash
docker run \
    -v `pwd`/api:/var/src/api/ \
    -p 5000:5000 \
    -d \
    --name api \
    climate-app-python
```

### View in Browser

Open http://localhost:5000/

### Run tests

```bash
docker exec api pytest -v
```

### View logs

```bash
docker logs api
```

Currently the default command when running the container is to output gcc command output

### Stop & remove container

```bash
docker stop api && docker rm api
```

### Regenerate requirements

```bash
docker run \
    -v `pwd`/api:/var/src/api \
    -p 5000:5000 \
    -d \
    --name api \
    --entrypoint /bin/bash \
    climate-app-python entrypoints/generate-requirements.sh
```

