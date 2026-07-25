const test = require('node:test');
const assert = require('node:assert/strict');

const {
  RECEIVER_STATES,
  calculateReconnectDelay,
  isHeartbeatStale,
  shouldResetBackoff,
  formatRelativeAge,
  getBatteryViewModel,
} = require('../bmb-logic.js');

test('receiver states expose the hardened lifecycle values', () => {
  assert.deepEqual(RECEIVER_STATES, {
    IDLE: 'idle',
    CONNECTING: 'connecting',
    LIVE: 'live',
    RECONNECTING: 'reconnecting',
    DEGRADED_BACKGROUND: 'degraded_background',
    DISCONNECTED: 'disconnected',
    STOPPED_BY_USER: 'stopped_by_user',
  });
});

test('reconnect delay grows with bounded exponential backoff and jitter cap', () => {
  const lowJitter = calculateReconnectDelay(1, { random: () => 0, jitterRatio: 0.25 });
  const highAttempt = calculateReconnectDelay(6, { random: () => 1, jitterRatio: 0.25, maxMs: 30000 });

  assert.equal(lowJitter, 1500);
  assert.equal(highAttempt, 30000);
});

test('heartbeat stale detector distinguishes fresh and stale links', () => {
  const now = 100_000;
  assert.equal(isHeartbeatStale({ lastHeartbeatAt: now - 10_000, now, timeoutMs: 30_000 }), false);
  assert.equal(isHeartbeatStale({ lastHeartbeatAt: now - 31_000, now, timeoutMs: 30_000 }), true);
  assert.equal(isHeartbeatStale({ lastHeartbeatAt: 0, now, timeoutMs: 30_000 }), true);
});

test('stable links reset reconnect backoff after the stable window', () => {
  const now = 60_000;
  assert.equal(shouldResetBackoff({ lastStableAt: now - 46_000, now, stableWindowMs: 45_000 }), true);
  assert.equal(shouldResetBackoff({ lastStableAt: now - 20_000, now, stableWindowMs: 45_000 }), false);
});

test('battery view model highlights low sender battery clearly', () => {
  const lowBattery = getBatteryViewModel({
    label: 'Sender battery',
    battery: { level: 12, charging: false },
    lowThreshold: 20,
  });

  assert.equal(lowBattery.visible, true);
  assert.equal(lowBattery.text, '12%');
  assert.equal(lowBattery.low, true);
  assert.equal(lowBattery.warning, 'Low battery');
  assert.equal(lowBattery.color, 'var(--red)');
});

test('battery view model handles unavailable battery source', () => {
  const unavailable = getBatteryViewModel({ label: 'This device', battery: null });
  assert.equal(unavailable.visible, false);
  assert.equal(unavailable.text, 'Unavailable');
});

test('relative heartbeat age is formatted for diagnostics', () => {
  assert.equal(formatRelativeAge(0), '—');
  assert.equal(formatRelativeAge(10_000, 10_500), '<1s ago');
  assert.equal(formatRelativeAge(10_000, 15_000), '5s ago');
  assert.equal(formatRelativeAge(10_000, 130_000), '2m ago');
});
