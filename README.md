# Clinician Toolkit Frontend

This repository contains the frontend code for the clinician toolkit. It is a SvelteKit application that is deployed as a Docker container. It is part of a greater set of Clinician Toolkit repositories, see the [build repository](https://github.com/childmindresearch/ctk-build) for the overall overview

## Getting Started

To get started, clone this repository and run `npm install` to install the dependencies. Then, run `npm run dev` to start the development server. Alternatively, you can use the Docker container to run the application. To do this, run `docker build -t clinician-toolkit-frontend .` to build the container, then `docker run -p 3000:3000 clinician-toolkit-frontend` to run the container.

## Deployment

The deployment of this application is handled by the [CTK-Build repository](https://github.com/childmindresearch/ctk-build). On each push to main, a new image will be built and the end-to-end tests will run in the aforementioned repository.

## Settings

The application is configured using environment variables. See `.env.example` for an up-to-date list of the required environment variables.
