<a name="readme-top"></a>

# 2022-WalkingWithDinosaurs
 
 ## Table of Contents
- [2022-WalkingWithDinosaurs](#2022-walkingwithdinosaurs)
- [Project Description](#project-description)
- [Stakeholders](#stakeholders)
- [User stories](#user-stories)
- [Quick links](#quick-links)

## Project Description

Client: Sebastian Steinig, University of Bristol

Project: The initial version of the project's web application developed by Sebastian Steinig team, who is a postdoctoral researcher at the School of Geographical Sciences (University of Bristol). The application using an innovative and interesting way to understand past and future climate changes around the world. It uses an intuitive new web application to show a 3D view of past worlds and environments, such as trees, even dinosaurs, based purely on the latest scientific data and climate model simulations. Our team will decide and create a fun solution for users to explore and learn about this fascinating Earth. Solutions can range from simpler third-person games all the way to immersive augmented or virtual reality solutions.


## User stories

As a geologist, our client wants to add some function (game or VR/VR) so that he can better present his research And make people better understand Earth's past and future climate change


## Stakeholders

School of Geographical Sciences(Lectures & Administrators)-These people use the application to show the climate change in the past world. And they can present their latest research data to students in a more intuitive way. Moreover, they want it to be easy to use, which present visually and intuitively.

School of Geographical Sciences(Students)-These people watch the application to learn the knowledge about climate change and geography. This can help them more intuitively understand the past and future of different areas of the world through 3D view in class. Additionally, they want the application to be more graphic and immersive.

University of Bristol-The university should ensure the confidentiality and security of this application. And,they should secure the database so that it is not subject to any scrutiny or reputational damage. If the project is a great success and involves a range of issues such as museum displays, the vital interests of the creator should be protected.

## Deploying to production

A remote Jenkins CI job controls deployment of the static site, [https://climatearchive.org/](https://climatearchive.org/). This periodically polls this Github hosted repo for new git tags.

Deployment is triggered by tagging the repo, to ensure deployments are from a fixed point on the main branch.

At present the automated deployment step has been disabled to support code reviews by Research IT prior to deployment. Once reviewed the the CI/CD pipeline is temporarily enabled to deploy the latest `v` prefixed tag of code to the production website. The Climate Archive npm Docker image is used to generate static files which are then deployed to https://climatearchive.org/ hosted on the Research IT's static hosting service, at the University of Bristol.

Example code to tag a new deployment.

```bash
git checkout main
git pull
git tag -a v0.0.7 -m "Deploy version 0.0.7 to production"
git push origin v0.0.7
```

## Development - using local node installation

### Installation

Prerequisistes:

* [Node.js](https://nodejs.org/en/download/).

Run the following commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```

### Running tests

On the command line:
``` bash
./node_modules/.bin/cypress run
```

With integrated user interface:
``` bash
./node_modules/.bin/cypress open
```

## Development - using Docker

Use the `Dockerfile` within repository to build a controlled node environment. This Docker image will then used to create and run a custom *node* Docker container, that installs development node packages and also runs the development server. Your local code will be mounted into the `/var/src/` directory of the running Docker container. This will allow you to see your local changes in your local browser.

### Installation

Build the docker image and call it `npm`
``` bash
docker build -t npm .
```

Run docker container with the newly created image `npm`, called `climate-map`. 
``` bash
docker run -v "`pwd`":/var/src/ -p 8080:8080 -d --name climate-map npm
```
    


## Quick Links

* [See our earth!](https://climatearchive.org)
* <a href="https://uob-my.sharepoint.com/:x:/g/personal/kl19661_bristol_ac_uk/EZDsRUPHkDhGjEEnc4nKxrkB0ju_A4ZkYsIewN9azT-Y3A">Gantt Chart</a>
* [Source code here(For groupmates)](https://github.com/sebsteinig/climate-archive)

<p align="right">(<a href="#readme-top">Back to top</a>)</p>
