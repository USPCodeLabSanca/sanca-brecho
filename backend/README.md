This is the backend of the Sanca Brechó project

### How to run in development mode

Follow these steps:
- Run `docker compose up -d` to start the project in production mode.
- Run `docker compose down` to stop the project.

### How to run in production mode

Follow these steps:
- Run `docker compose -f docker-compose.prod.yaml build` to build the project (this will create a new image for the project). Be cautious, as it does not delete the old image, so you will need to remove it manually.
- Run `docker compose -f docker-compose.prod.yaml up -d` to start the project in production mode.
- Run `docker compose -f docker-compose.prod.yaml down` to stop the project.

### To see running containers and logs

docker ps
docker logs -f <CONTAINER ID>