# Simple WebRTC

This work is firstly inspired by [simple-signaling-server](https://www.100ms.live/blog/webrtc-python-react-app) and then futher extended.

Now the [ObserveRTC](https://github.com/Master2022E/client-monitor-js) client is needed locally in af folder next to this projects folder. And run the command `npm install ../client-monitor-js/`. Each time there is an update to that module. Also typescript might be need. Install with `npm install -g typescript`.

To run the application locally

```shell
make local-install
make local-run
```

To build and run as a docker container

```shell
make -i
```

To stop the docker container

```shell
make stop
```

The preferred way of publishing is through the GitHub release page. Alternatively can it be done manually with the following

```shell
docker login
make -i publish username=foo
```

To run the selenium test suite, start the app and run the tests.

```shell
python -m pip install -r requirements.txt
python -m pytest
```

To run the application on a server there needs to be TLS. Therefor look in the [deployment](./deployment/) folder for the [docker-compose.yaml](./deployment/docker-compose.yaml) file that describes the deployment.

The concept of the deplyment is to place [Caddy](https://caddyserver.com/) in front of the application and let it work as a reverse proxy that will terminate the TLS to the application. The advantage to using Caddy is that it automatically gets TLS certificates from [Let's Encrypt](https://letsencrypt.org/).

Setup process:

1. Copy the docker-compose.yaml file to the server

2. Copy the webrtc.envExample to a file called webrtc.env on the server and fill in configurations.

3. Copy the data/caddy/Caddy file to the server in the same relative path to the docker-compose file, and update the domain names accordingly. 

4. Create the folders ./data/caddy/data and ./data/caddy/config
    
    `mkdir -p data/caddy/data && mkdir -p data/caddy/config`


5. Run `docker-compose up -d`

> **_NOTE 1:_**  Open the firewall on the server.

> **_NOTE 2:_**  To get the application working is TLS required. According to [blog.mozilla.org](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/), this is done to incease the security of regular users.