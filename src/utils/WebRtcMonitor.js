import { ClientMonitor } from '@observertc/client-monitor-js';

const observeRTCUrl = process.env.REACT_APP_OBSERVERTC_URL;
const observeRTCPort = process.env.REACT_APP_OBSERVERTC_PORT;
const observeRTCPath = process.env.REACT_APP_OBSERVERTC_PATH;

if (observeRTCUrl === undefined || observeRTCPort === undefined || observeRTCPath === undefined) {
  console.error("Missing one or more required environment variables: REACT_APP_OBSERVERTC_DOMAIN, REACT_APP_OBSERVERTC_PORT, REACT_APP_OBSERVERTC_PATH")
}

const config = {
  collectingPeriodInMs: 5000,
  samplingPeriodInMs: 10000,
  sendingPeriodInMs: 15000,
  sender: {
    format: "protobuf",
    websocket: {
      urls: [observeRTCUrl + ":" + observeRTCPort + observeRTCPath],
      maxRetries: 3,
    }
  }
};

export function monitor(sampler) {
  let x = Object.assign({}, config, sampler);
  console.log("ObserveRTC config: ", x)
  return ClientMonitor.create(x)
}
