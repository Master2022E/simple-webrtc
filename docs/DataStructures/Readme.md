# Test of data structures

As a part of [#5](https://github.com/Master2022E/simple-webrtc/issues/5) have we here gathered payloads from a run through a chrome browser.

a list is gathered in [chrome.json](./chrome.json). and then each type of the types `INBOUND_VIDEO_TRACK`, `OUTBOUND_VIDEO_TRACK`, `INBOUND_AUDIO_TRACK`, `OUTBOUND_AUDIO_TRACK` is in the following documents for easy comparison.

- [./chrome-inbound-audio.json](./chrome-inbound-audio.json)
- [./chrome-inbound-video.json](./chrome-inbound-video.json)
- [./chrome-outbound-audio.json](./chrome-outbound-audio.json)
- [./chrome-outbound-video.json](./chrome-outbound-video.json)

the following query has been used to find them:

```shell
// Chrome client id: 42510e41-b299-40b9-a87a-6c93e21821f2

db.reports.find({type: { $in: ["INBOUND_VIDEO_TRACK", "OUTBOUND_VIDEO_TRACK", "INBOUND_AUDIO_TRACK", "OUTBOUND_AUDIO_TRACK"] }, "payload.clientId" : "42510e41-b299-40b9-a87a-6c93e21821f2" })
```

The test is not done yet. But in this run is the outbound jitter not `null`. And we need to figure out of this is an issue. or we can live without it since we have data from both clients.

Next up is testing our [firefox implementation of ObserveRTC](https://github.com/Master2022E/client-monitor-js).

---

Tests is in [./firefox.json](./firefox.json) and then also individually in

- [./firefox-inbound-audio.json](./firefox-inbound-audio.json)
- [./firefox-inbound-video.json](./firefox-inbound-video.json)
- [./firefox-outbound-audio.json](./firefox-outbound-audio.json)
- [./firefox-outbound-video.json](./firefox-outbound-video.json)

with the query:

```shell
// Firefox client id: 35b098ea-31f3-4265-af50-0b410b6970b9

db.reports.find({type: { $in: ["INBOUND_VIDEO_TRACK", "OUTBOUND_VIDEO_TRACK", "INBOUND_AUDIO_TRACK", "OUTBOUND_AUDIO_TRACK"] }, "payload.clientId" : "35b098ea-31f3-4265-af50-0b410b6970b9" })
```

The difference is small, but significant.

We will try to add more information in the firefox implementation.

---

It seems difficult to add the data that we want to the sampler in the ObserveRTC module.

Therefor did we add our own metrics data in on onStatsCollected with the function addExtensionStats.