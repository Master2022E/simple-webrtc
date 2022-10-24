import { useParams } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import socketio from "socket.io-client";
import "./CallScreen.css";

import { ClientMonitor } from "@observertc/client-monitor-js";

// see full config in Configuration section
const config = {
  collectingPeriodInMs: 5000,
};






function CallScreen() {
  const params = useParams();
  const localUsername = params.username;
  const roomName = params.room;
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const signalUrl = "https://signal.thomsen-it.dk"
  console.log(signalUrl)

  const [ip, setip] = useState("")
  const [VideoRTT, setVideoRTT] = useState("")
  const [AudioRTT, setAudioRTT] = useState("")
  const [VideoStat, setVideoStat] = useState("")
  const [AudioStat, setAudioStat] = useState("")



  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log( this.responseText);
      setip(this.responseText);
    }   
  };  
  xhttp.open("GET", "//api.ipify.org?format=json", true);
  xhttp.send();


  const socket = socketio(signalUrl, {
    autoConnect: false,
  });

  let pc; // For RTCPeerConnection Object

  const sendData = (data) => {
    socket.emit("data", {
      username: localUsername,
      room: roomName,
      data: data,
    });
  };

  const startConnection = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          height: 350,
          width: 350,
        },
      })
      .then((stream) => {
        console.log("Local Stream found");
        localVideoRef.current.srcObject = stream;
        socket.connect();
        socket.emit("join", { username: localUsername, room: roomName });
      })
      .catch((error) => {
        console.error("Stream not found: ", error);
      });
  };

  const onIceCandidate = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate");
      sendData({
        type: "candidate",
        candidate: event.candidate,
      });
    }
  };

  const onTrack = (event) => {
    console.log("Adding remote track");
    remoteVideoRef.current.srcObject = event.streams[0];
  };

  const createPeerConnection = () => {
    try {
      const turnUrl = "turn:turn.thomsen-it.dk?transport=tcp"
      const turnUsername = "Jonas1"
      const turnPassword = "kode112"
      console.log(turnUrl, turnUsername, turnPassword)
      pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: turnUrl,
            username: turnUsername,
            credential: turnPassword,
          },
        ],
      });
      pc.onicecandidate = onIceCandidate;
      pc.ontrack = onTrack;
      const localStream = localVideoRef.current.srcObject;
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
      const monitor = ClientMonitor.create(config);
        monitor.addStatsCollector({
        id: "collectorId",
        getStats: () => pc.getStats(),
      });


      monitor.events.onStatsCollected(() => {
        const storage = monitor.storage;
        for (const inboundRtp of storage.inboundRtps()) {
            const trackId = inboundRtp.getTrackId();
            const remoteOutboundRtp = inboundRtp.getRemoteOutboundRtp();

            const { framesReceived, kind } = inboundRtp.stats;
            //if (kind !== "video") continue;
            const temp0 = inboundRtp.stats;
            if (kind == "video") {
              setVideoStat("kind:"+temp0["kind"]+", jitterBufferDelay:"+temp0["jitterBufferDelay"]+", jitter:"+temp0["jitter"]+", packetsReceived:"+temp0["packetsReceived"]+", packetsLost:"+temp0["packetsLost"]+", type:"+temp0["type"]);
            }else if (kind == "audio"){
              setAudioStat("kind:"+temp0["kind"]+", jitterBufferDelay:"+temp0["jitterBufferDelay"]+", jitter:"+temp0["jitter"]+", packetsReceived:"+temp0["packetsReceived"]+", packetsLost:"+temp0["packetsLost"]+", type:"+temp0["type"]);
            }

            if (remoteOutboundRtp == undefined){
              console.log("option 1",trackId, inboundRtp.stats)
            }
            else{
              console.log("option 2",trackId, inboundRtp.stats, remoteOutboundRtp.stats);
              //console.log("kind:"+temp0["kind"],"jitterBufferDelay:"+temp0["jitterBufferDelay"],"jitter:"+temp0["jitter"],"packetsReceived:"+temp0["packetsReceived"],"packetsLost:"+temp0["packetsLost"],"type:"+temp0["type"])
              
              /*
                Example of a packet from firefox
                temp0 = {
                "id": "69933c0b",
                "type": "inbound-rtp",
                "codecId": "1270a47b",
                "kind": "video",
                "mediaType": "video",
                "ssrc": 1269111426,
                "discardedPackets": 0,
                "jitter": 0.038955555555555556,
                "packetsDiscarded": 0,
                "packetsLost": 0,
                "packetsReceived": 1529,
                "bytesReceived": 1009815,
                "firCount": 0,
                "frameHeight": 224,
                "frameWidth": 350,
                "framesDecoded": 1282,
                "framesPerSecond": 16,
                "framesReceived": 1284,
                "headerBytesReceived": 36768,
                "jitterBufferDelay": 126.159,
                "jitterBufferEmittedCount": 1282,
                "lastPacketReceivedTimestamp": 1666556261004,
                "nackCount": 0,
                "pliCount": 0,
                "remoteId": "b936bade",
                "totalDecodeTime": 2.32,
                "totalInterFrameDelay": 63.580000000000055,
                "totalProcessingDelay": 135.07665699999998,
                "totalSquaredInterFrameDelay": 7.849490000000027
                }
              */
            }
              
        }

        const RTTs = new Map();
        for (const outboundRtp of monitor.storage.outboundRtps()) {
            const remoteInboundRtp = outboundRtp.getRemoteInboundRtp();
            const { roundTripTime } = remoteInboundRtp.stats;

            const { framesReceived, kind } = remoteInboundRtp.stats;

            //if (kind !== "video") continue;
            const peerConnectionId = outboundRtp.getPeerConnection()?.collectorId;
            let measurements = RTTs.get(peerConnectionId);
            const trackId = outboundRtp.getTrackId();
            //console.log("TrackID: ",trackId)
            if (!measurements) {
                measurements = [];
                RTTs.set(kind, measurements);
            }
            measurements.push(roundTripTime);

            if (kind == "video") {
              setVideoRTT(roundTripTime + " s")
            }else if (kind == "audio"){
              setAudioRTT(roundTripTime + " s")
            }

        }
        // here you have the RTT measurements groupped by peer connections
        if (RTTs.size != 0){
          console.log(Array.from(RTTs.entries()));
        }

      });
      console.log("PeerConnection created");
    } catch (error) {
      console.error("PeerConnection failed: ", error);
    }
  };

  const setAndSendLocalDescription = (sessionDescription) => {
    pc.setLocalDescription(sessionDescription);
    console.log("Local description set");
    sendData(sessionDescription);
  };

  const sendOffer = () => {
    console.log("Sending offer");
    pc.createOffer().then(setAndSendLocalDescription, (error) => {
      console.error("Send offer failed: ", error);
    });
  };

  const sendAnswer = () => {
    console.log("Sending answer");
    pc.createAnswer().then(setAndSendLocalDescription, (error) => {
      console.error("Send answer failed: ", error);
    });
  };

  const signalingDataHandler = (data) => {
    if (data.type === "offer") {
      createPeerConnection();
      pc.setRemoteDescription(new RTCSessionDescription(data));
      sendAnswer();
    } else if (data.type === "answer") {
      pc.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.type === "candidate") {
      pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } else {
      console.log("Unknown Data");
    }
  };


  socket.on("ready", () => {
    console.log("Ready to Connect!");
    createPeerConnection();
    sendOffer();
  });

  socket.on("data", (data) => {
    console.log("Data received: ", data);
    signalingDataHandler(data);
  });

  useEffect(() => {
    startConnection();
    return function cleanup() {
      pc?.close();
    };
  }, []);

  return (
    <div>
      <h1>Your IP {ip}</h1>
      <label>{"Username: " + localUsername}</label>
      <label>{"Room Id: " + roomName}</label>
      <label>{"Video RTT: " + VideoRTT}</label>
      <label>{"Audio RTT: " + AudioRTT}</label>
      <label>{"VideoStat: " + VideoStat}</label>
      <label>{"AudioStat: " + AudioStat}</label>
      <video autoPlay muted playsInline ref={localVideoRef} />
      <video autoPlay playsInline ref={remoteVideoRef} />
    </div>
  );
}

export default CallScreen;
