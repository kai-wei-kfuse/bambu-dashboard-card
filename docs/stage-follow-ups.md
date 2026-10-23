# Stage follow-ups

## Stage 2

- [ ] Verify completion notification sound on the selected phone during a real print, including alarm volume, channel permissions and Do Not Disturb behavior. Configuration persistence is already verified without sending a notification.
- [ ] Validate start/pause/resume/stop, light behavior and speed changes on physical hardware with an operator present.
- [ ] Verify camera and capability rendering on models beyond A1 / AMS Lite.
- [ ] Validate a real external HA camera's live/image playback, latency and quality once hardware is connected. Discovery, preference persistence, error states and native stream/image mode selection are covered by synthetic tests; the real HA empty picker has been verified.
- [ ] Verify a clean HACS installation and publish a stable release after the remaining validation. The v0.1.0 public milestone does not establish a clean-install test result.

## Stage 3

- [ ] Evaluate complete cloud/local print history only if requested; cached files cannot serve as a complete print log.
