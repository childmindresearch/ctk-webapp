# Clinician Toolkit Frontend

This repository contains the frontend code for the clinician toolkit. It is a Svelte application that uses the [Flowbite](https://flowbite-svelte.com/) component library. It is deployed as a Docker container.

## Getting Started

To get started, clone this repository and run `npm install` to install the dependencies. Then, run `npm run dev` to start the development server. Alternatively, you can use the Docker container to run the application. To do this, run `docker build -t clinician-toolkit-frontend .` to build the container, then `docker run -p 3000:3000 clinician-toolkit-frontend` to run the container.

## Deployment

The deployment of this application is handled by the [CTK-Orchestrator repository](https://github.com/childmindresearch/ctk-orchestrator). On each push to main, this repository will be built and deployed to the Github Container Registry.

## Settings

The application is configured using environment variables. The following environment variables are used:

-   `VITE_API_URL`: The URL of the backend API. Defaults to `http://localhost:8000`.
