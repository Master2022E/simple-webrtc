IMAGE_NAME=webrtc-server
CONTAINER_NAME=webrtc-server

all: run

logs:
	docker logs $(CONTAINER_NAME) -f

publish: tag
	docker push $(username)/$(IMAGE_NAME):latest

tag: build
	docker tag $(IMAGE_NAME) $(username)/$(IMAGE_NAME):latest

run: build
	docker run -d -p 3000:3000 --env-file .env --name $(CONTAINER_NAME) $(IMAGE_NAME):latest

build: clean_up
	docker build . -t $(IMAGE_NAME)

clean_up: stop
	docker rm $(CONTAINER_NAME)
	docker rmi $(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME)

local-install:
	npm i

lcoal-run:
	npm start