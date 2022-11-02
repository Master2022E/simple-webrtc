# Test of data structures

As a part of [#5](https://github.com/Master2022E/simple-webrtc/issues/5) have we here gathered payloads from a run through a chrome browser.

a list is gathered in [chrome.json](./chrome.json). and then each type of the types `INBOUND_VIDEO_TRACK`, `OUTBOUND_VIDEO_TRACK`, `INBOUND_AUDIO_TRACK`, `OUTBOUND_AUDIO_TRACK` is in the following documents for easy comparison.

- [./chrome-inbound-audio.json](./chrome-inbound-audio.json)
- [./chrome-inbound-video.json](./chrome-inbound-video.json)
- [./chrome-outbound-audio.json](./chrome-outbound-audio.json)
- [./chrome-outbound-video.json](./chrome-outbound-video.json)

The test is not done yet. But in this run is the outbound jitter not `null`. And we need to figure out of this is an issue. or we can live without it since we have data from both clients.

Next up is testing our [firefox implementation of ObserveRTC](https://github.com/Master2022E/client-monitor-js).