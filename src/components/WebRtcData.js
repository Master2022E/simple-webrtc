
const WebRtcData = ({ videoStat, audioStat, videoRTT, audioRTT }) => {



  return (
    <div style={{ color: "#000000" }}>
      <h1>WebRTC stats</h1>
      <table style={{ margin: "auto" }}>
        <tbody>
          <tr><td>kind</td><td>{videoStat.kind}</td><td>{audioStat.kind}</td></tr>
          <tr><td>RTT [s]</td><td>{videoRTT.toFixed(5)}</td><td>{audioRTT.toFixed(5)}</td></tr>
          {videoStat.jitter !== undefined &&
            < tr ><td>jitter</td><td>{videoStat.jitter.toFixed(5)}</td><td>{audioStat.jitter.toFixed(5)}</td></tr>
          }
          <tr><td>jitterBufferDelay</td><td>{videoStat.jitterBufferDelay}</td><td>{audioStat.jitterBufferDelay}</td></tr>
          <tr><td>packetsReceived</td><td>{videoStat.packetsReceived}</td><td>{audioStat.packetsReceived}</td></tr>
          <tr><td>packetsLost</td><td>{videoStat.packetsLost}</td><td>{audioStat.packetsLost}</td></tr>
          <tr><td>type</td><td>{videoStat.type}</td><td>{audioStat.type}</td></tr>
        </tbody>
      </table>

    </div >
  );
};

export default WebRtcData;
