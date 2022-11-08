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
    roomId: "0",          // Generated from the user
    clientId: uuidv4(),   // Keep as a UUID
    userId: uuidv4(),     // Generated from the user
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
