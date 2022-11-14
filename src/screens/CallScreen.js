import { useParams } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Location from "../components/Location";
import socketio from "socket.io-client";
import "./CallScreen.css";
//import { ClientMonitor } from "@observertc/client-monitor-js";
import WebRtcData from "../components/WebRtcData";
import * as WebRtCMonitor from "../utils/WebRtcMonitor";
import { v4 as uuidv4 } from 'uuid';


const signalUrl = process.env.REACT_APP_SIGNAL_URL;
const turnUrl = process.env.REACT_APP_TURN_URL;
const turnUsername = process.env.REACT_APP_TURN_USERNAME;
const turnPassword = process.env.REACT_APP_TURN_PASSWORD;
const useFakeCamera = process.env.REACT_APP_USE_FAKE_CAMERA;


console.log("Signal config:", signalUrl);
console.log("Turn config:", turnUrl, turnUsername);

function CallScreen({ clientId }) {
  const { username, room } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);


  const [logRtp, setLogRtp] = useState(false);
  const stateRef = useRef();
  stateRef.current = logRtp

  const [videoRTT, setVideoRTT] = useState(0);
  const [audioRTT, setAudioRTT] = useState(0);
  const [videoStat, setVideoStat] = useState({});
  const [audioStat, setAudioStat] = useState({});


  const socket = socketio(signalUrl, {
    autoConnect: false,
  });

  let pc; // For RTCPeerConnection Object

  const sendData = (data) => {
    socket.emit("data", {
      username: username,
      room: room,
      data: data,
    });
  };

  const fakeCamera = () => {
    if (useFakeCamera.toUpperCase() === "TRUE".toUpperCase()) {
      return true
    }
    return false;
  }

  const startConnection = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        fake: fakeCamera(),
        video: {
          height: 350,
          width: 350,
        },
      })
      .then((stream) => {
        console.log("Local Stream found");
        localVideoRef.current.srcObject = stream;
        socket.connect();
        socket.emit("join", { username: username, room: room });
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

      const monitor = WebRtCMonitor.monitor({
        sampler: {
          roomId: room,         // Generated from the user
          clientId: clientId,   // Keep as a UUID
          userId: username,     // Generated from the user
        }
      })

      monitor.addStatsCollector({
        id: uuidv4(),
        getStats: () => pc.getStats(),
      });

      monitor.events.onStatsCollected(() => {
        // First lets look at the data that we send to the receiver.
        // This includes outbound-rtp and remote-inbound.rtp

        console.log("Stats collected");

        const doLog = stateRef.current

        for (const outboundRtp of monitor.storage.outboundRtps()) {

          // The outbound-rtp contains information of the type of data that we send.
          // Active, targetBitrate, framesSent, packetsSent, bytesSent

          // NOTE: In FireFox is all these undefined.
          //const ssrc = outboundRtp.getSsrc()
          //const trackId = outboundRtp.getTrackId()
          //const mediaSource = outboundRtp.getMediaSource()
          //const sender = outboundRtp.getSender()

          const stats = outboundRtp.stats
          if (doLog) {
            console.log("outboundRtp (" + stats.kind + ")", stats)
          }
          monitor.addExtensionStats({
            type: "OUT_BOUND_RTC",
            payload: JSON.stringify({
              "stats": stats
            }),
          })
          /* stats contains: {
            bytesSent: 918743,
            codecId: "3510ff05",
            firCount: 0,
            frameHeight: 350,
            frameWidth: 350,
            framesEncoded: 1360,
            framesSent: 1360,
            headerBytesSent: 38160,
            hugeFramesSent: 0,
            id: "c17b71eb",
            kind: "video",
            mediaType: "video",
            nackCount: 0,
            packetsSent: 1361,
            pliCount: 0,
            qpSum: 3150,
            remoteId: "d9a622b",
            retransmittedBytesSent: 0,
            retransmittedPacketsSent: 0,
            ssrc: 683143463,
            timestamp: undefined,
            totalEncodeTime: 2.021,
            totalEncodedBytesTarget: 7495329,
            type: "outbound-rtp"
          } */

          const remoteInboundRtp = outboundRtp.getRemoteInboundRtp();

          const remoteInboundRtpStats = remoteInboundRtp.stats

          const { roundTripTime, kind } = remoteInboundRtp.stats;
          if (doLog) {
            console.log("remoteInboundRtp (" + kind + ")", remoteInboundRtp.stats)
          }

          monitor.addExtensionStats({
            type: "REMOTE_IN_BOUND_RTC",
            payload: JSON.stringify({
              "stats": remoteInboundRtpStats
            }),
          })

          if (kind === "video") {
            setVideoRTT(roundTripTime)
            /* stats contains: {
              codecId: "57e44166",
              fractionLost: 0,
              id: "49881f3",
              jitter: 0.004,
              kind: "video",
              localId: "93489802",
              mediaType: "video",
              packetsLost: 0,
              packetsReceived: 97,
              roundTripTime: 0.026,
              roundTripTimeMeasurements: 40,
              ssrc: 3647127630,
              timestamp: undefined,
              totalRoundTripTime: 0.776,
              type: "remote-inbound-rtp"
            } */
          } else if (kind === "audio") {
            setAudioRTT(roundTripTime)
            /* stats contains: {
              codecId: "ce84b808",
              fractionLost: 0,
              id: "1c3c052d",
              jitter: 0.004,
              kind: "audio",
              localId: "e9eea0d0",
              mediaType: "audio",
              packetsLost: 0,
              packetsReceived: 1191,
              roundTripTime: 0.021,
              roundTripTimeMeasurements: 20,
              ssrc: 342435103,
              timestamp: undefined,
              totalRoundTripTime: 0.376,
              type: "remote-inbound-rtp"
            } */
          }
        }


        // For the inboundRtp can we read information about what is being sent to us.
        // 
        for (const inboundRtp of monitor.storage.inboundRtps()) {

          // NOTE: In FireFox is all these undefined.
          // const receiver = inboundRtp.getReceiver() 
          // const trackId = inboundRtp.getTrackId() 
          // const audioPlayout = inboundRtp.getAudioPlayout()
          // const ssrc = inboundRtp.getSsrc() // contains a number i.e. 3244738933, It is also in both the stats and remoteOutboundRtp.

          const stats = inboundRtp.stats
          if (doLog) {
            console.log("inboundRtp (" + stats.kind + ")", stats)
          }

          monitor.addExtensionStats({
            type: "IN_BOUND_RTC",
            payload: JSON.stringify({
              "stats": stats
            }),
          })

          /* stats contains: {
            bytesReceived: 427194,
            codecId: "3d5f88e5",
            discardedPackets: 0,
            firCount: 0,
            frameHeight: 350,
            frameWidth: 350,
            framesDecoded: 610,
            framesPerSecond: 22,
            framesReceived: 610,
            headerBytesReceived: 17176,
            id: "fe1b8f93",
            jitter: 0.0048111111111111115,
            jitterBufferDelay: 14.001,
            jitterBufferEmittedCount: 609,
            kind: "video",
            lastPacketReceivedTimestamp: 1667816599642,
            mediaType: "video",
            nackCount: 0,
            packetsDiscarded: 0,
            packetsLost: 0,
            packetsReceived: 612,
            pliCount: 0,
            qpSum: 1698,
            remoteId: "a6eb54c4",
            ssrc: 63934536,
            timestamp: undefined,
            totalDecodeTime: 0.584,
            totalInterFrameDelay: 34.722999999999914,
            totalProcessingDelay: 11.935091,
            totalSquaredInterFrameDelay: 2.2930650000000004,
            type: "inbound-rtp"
          } */


          const remoteOutboundRtp = inboundRtp.getRemoteOutboundRtp()

          const remoteOutboundRtpStats = remoteOutboundRtp.stats

          if (doLog) {
            console.log("remoteOutboundRtp (" + remoteOutboundRtpStats.kind + ")", remoteOutboundRtpStats)
          }

          monitor.addExtensionStats({
            type: "REMOTE_OUT_BOUND_RTC",
            payload: JSON.stringify({
              "stats": remoteOutboundRtpStats
            }),
          })

          const { kind } = inboundRtp.stats;
          //if (kind !== "video") continue;
          const temp0 = inboundRtp.stats;
          if (kind === "video") {
            setVideoStat(temp0)
            /* stats contains: {
              bytesSent: 923899,
              codecId: "dfd798a1",
              id: "5fd904dd",
              kind: "video",
              localId: "2e992f49",
              mediaType: "video",
              packetsSent: 1371,
              remoteTimestamp: 1667817904210,
              ssrc: 4115537781,
              timestamp: undefined,
              type: "remote-outbound-rtp"
            } */
          } else if (kind === "audio") {
            setAudioStat(temp0)
            /* stats contains: {
              bytesSent: 21734,
              codecId: "f0555668",
              id: "75cec9da",
              kind: "audio",
              localId: "a5377156",
              mediaType: "audio",
              packetsSent: 134,
              remoteTimestamp: 1667817834337,
              ssrc: 439550741,
              timestamp: undefined,
              type: "remote-outbound-rtp"
            } */
          }
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
    console.log("Data received: ", data.type);
    signalingDataHandler(data);
  });

  useEffect(() => {
    startConnection();
    return function cleanup() {
      pc?.close();
    };
  }, []);

  const handleChange = (e) => {
    const { checked } = e.target
    setLogRtp(checked)
  }

  return (
    <div>
      <Location></Location>
      <WebRtcData videoStat={videoStat} audioStat={audioStat} videoRTT={videoRTT} audioRTT={audioRTT}></WebRtcData>
      <label>{"Username: " + username}</label>
      <label>{"Room Id: " + room}</label>
      <label>{"Client Id: " + clientId}</label>

      <video autoPlay muted playsInline ref={localVideoRef} />
      <video autoPlay playsInline ref={remoteVideoRef} />

      <div style={{ color: "#000000" }}>
        <table>

        </table>
        <tr>
          <td>
            <p>Enable console logging of RTP data connections:</p>
          </td>
          <td>
            <input type="checkbox" onChange={handleChange} defaultChecked={logRtp} />

          </td>
        </tr>

      </div>
    </div>
  );
}

export default CallScreen;
