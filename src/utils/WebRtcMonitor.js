import { ClientMonitor } from '@observertc/client-monitor-js';
//import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

const observeRTCDomain = process.env.REACT_APP_OBSERVERTC_DOMAIN;
const observeRTCPort = process.env.REACT_APP_OBSERVERTC_PORT;
const observeRTCPath = process.env.REACT_APP_OBSERVERTC_PATH;

const config = {
  collectingPeriodInMs: 5000,
  samplingPeriodInMs: 10000,
  sendingPeriodInMs: 15000,
  sampler: {
    roomId: 0,
    clientId: uuidv4(),
    userId: uuidv4(),
  },
  sender: {
    format: "protobuf",
    websocket: {
      urls: ["ws://" + observeRTCDomain + ":" + observeRTCPort + observeRTCPath],
      maxRetries: 3,
    }
  }
};

export const monitor = ClientMonitor.create(config);


// define the metrics you want to expose
//const METRICS_UPDATED = 'metricsUpdated';
//const emitter = new EventEmitter();
/*type TrackLayerMetrics = {
  kind: string,
  ssrc: number,
  encodedFps?: number,
  decodedFps?: number,
  receivedFps?: number,
  sentFps?: number,
  sndKbps?: number,
  rcvKbps?: number,
};
type TrackMetrics = {
  layers: Map<number, TrackLayerMetrics>;
}

export type PeerConnectionMetrics = {
  label?: string;
  rtt?: number;
};
export type Metrics = {
  statsCollectedInMs: number;
  peerConnections: Map<string, PeerConnectionMetrics>;
  tracks: Map<string, TrackMetrics>;
};
export type MetricsListener = (metrics: Metrics) => void;
*/
/*
export function onMetricsUpdated(listener : MetricsListener) {
  emitter.on(METRICS_UPDATED, listener);
}

export function offMetricsUpdated(listener : MetricsListener) {
  emitter.off(METRICS_UPDATED, listener);
}

function emitMetricsUpdated(metrics : Metrics) {
  emitter.emit(METRICS_UPDATED, metrics);
}
*/
monitor.events.onStatsCollected(() => {
  const storage = monitor.storage;
  for (const peerConnection of storage.peerConnections()) {
    const { stats } = peerConnection;
    console.log(peerConnection.id, 'stats:', stats);
  }
});
monitor.events.onSampleCreated(sample => {
  console.log('Sample is created', sample);
});

monitor.events.onSampleSent(() => {
  console.log('Samples are sent to the observer');
});
// lets have fun with metrics
const traces = new Map /*< string, any>*/();
monitor.events.onStatsCollected(() => {
  const peerConnectionRtts = new Map /*< string, number[]>*/();
  const metrics /*: Metrics*/ = {
    peerConnections: new Map(),
    statsCollectedInMs: monitor.metrics.collectingTimeInMs,
    tracks: new Map(),
  };
  for (const inboundRtp of monitor.storage.inboundRtps()) {
    const { ssrc, bytesReceived, framesDecoded, framesReceived, kind } =
      inboundRtp.stats;
    const trackId = inboundRtp.getTrackId();
    const traceId = `${trackId}-${ssrc}`;
    const trace = traces.get(traceId);
    const updateTrace = () => traces.set(traceId, {
      bytesReceived,
      framesDecoded,
      framesReceived,
      timestamp: Date.now(),
    });
    if (!trace) {
      updateTrace();
      continue;
    }
    let trackMetrics = metrics.tracks.get(trackId);
    if (!trackMetrics) {
      trackMetrics = {
        layers: new Map(),
      };
      metrics.tracks.set(trackId, trackMetrics);
    }
    let layerMetric = trackMetrics.layers.get(ssrc);
    if (!layerMetric) {
      layerMetric = { ssrc, kind };
      trackMetrics.layers.set(ssrc, layerMetric);
    }
    const timeElapsedInMs = Date.now() - trace.timestamp;
    const timeElapsedInS = timeElapsedInMs / 1000.;
    if (kind === 'video') {
      layerMetric.decodedFps =
        Math.ceil((framesDecoded - trace.framesDecoded) / timeElapsedInS);
      layerMetric.receivedFps =
        Math.ceil((framesReceived - trace.framesReceived) / timeElapsedInS);
    }
    layerMetric.rcvKbps =
      ((bytesReceived - trace.bytesReceived) * 8) / timeElapsedInMs;
    updateTrace();
  }

  for (const outboundRtp of monitor.storage.outboundRtps()) {
    const { ssrc, bytesSent, framesEncoded, framesSent, kind } =
      outboundRtp.stats;
    const trackId = outboundRtp.getTrackId();
    const traceId = `${trackId}-${ssrc}`;
    const trace = traces.get(traceId);
    const remoteInboundRtp = outboundRtp.getRemoteInboundRtp();
    const peerConnection = outboundRtp.getPeerConnection();
    if (remoteInboundRtp && peerConnection) {
      const { roundTripTime } = remoteInboundRtp.stats || {};
      if (roundTripTime) {
        const rtts = peerConnectionRtts.get(peerConnection.collectorId) || [];
        rtts.push(roundTripTime);
        peerConnectionRtts.set(peerConnection.collectorId, rtts);
      }
    }
    const updateTrace = () => traces.set(traceId, {
      bytesSent,
      framesEncoded,
      framesSent,
      timestamp: Date.now(),
    });
    if (!trace) {
      updateTrace();
      continue;
    }
    let trackMetrics = metrics.tracks.get(trackId);
    if (!trackMetrics) {
      trackMetrics = {
        layers: new Map(),
      };
      metrics.tracks.set(trackId, trackMetrics);
    }
    let layerMetric = trackMetrics.layers.get(ssrc);
    if (!layerMetric) {
      layerMetric = { ssrc, kind };
      trackMetrics.layers.set(ssrc, layerMetric);
    }
    const timeElapsedInMs = Date.now() - trace.timestamp;
    const timeElapsedInS = timeElapsedInMs / 1000.;
    if (kind === 'video') {
      layerMetric.encodedFps =
        Math.ceil((framesEncoded - trace.framesEncoded) / timeElapsedInS);
      layerMetric.sentFps =
        Math.ceil((framesSent - trace.framesSent) / timeElapsedInS);
    }
    layerMetric.sndKbps = ((bytesSent - trace.bytesSent) * 8) / timeElapsedInMs;
    updateTrace();
  }
  const median = (arr/*: number[]*/) => {
    let middle = Math.floor(arr.length / 2);
    arr = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? arr[middle] :
      (arr[middle - 1] + arr[middle]) / 2;
  };
  for (const peerConnection of monitor.storage.peerConnections()) {
    const rtts = peerConnectionRtts.get(peerConnection.collectorId);
    const rtt = rtts ? median(rtts) : undefined;
    const peerConnectionId = peerConnection.collectorId;
    const pcMetrics = {
      label: peerConnection.collectorLabel,
      rtt,
    };
    metrics.peerConnections.set(peerConnectionId, pcMetrics);
  }
  console.log("onStatsCollected Metrics:", metrics)
  //  emitMetricsUpdated(metrics);
});
