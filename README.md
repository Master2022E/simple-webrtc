# Simple WebRTC

This work is firstly inspired by [simple-signaling-server](https://www.100ms.live/blog/webrtc-python-react-app) and then futher extended.

To run the application locally

```shell
make local-install
make local-run
```

To build and run as a docker container

```shell
make -i
```

To publish the docker image

```shell
docker login
make -i publish username=foo
```


to run the docker image on a server

```shell
docker run -d -p 3000:3000 --env-file .env --name webrtc-server username/webrtc-server:latest
```

> **_NOTE 1:_**  make a copy of the .envExample called .env on the server and fill in configurations.

> **_NOTE 2:_**  Open the firewall on the server.

> **_NOTE 3:_**  To get the application working is TLS required. according to [blog.mozilla.org](https://blog.mozilla.org/webrtc/camera-microphone-require-https-in-firefox-68/), this is done to incease the security of regular users.