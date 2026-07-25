'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.BMBLogic = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const RECEIVER_STATES = Object.freeze({
    IDLE: 'idle',
    CONNECTING: 'connecting',
    LIVE: 'live',
    RECONNECTING: 'reconnecting',
    DEGRADED_BACKGROUND: 'degraded_background',
    DISCONNECTED: 'disconnected',
    STOPPED_BY_USER: 'stopped_by_user',
  });

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function calculateReconnectDelay(attempt, opts = {}) {
    const baseMs = opts.baseMs ?? 1500;
    const maxMs = opts.maxMs ?? 30000;
    const jitterRatio = opts.jitterRatio ?? 0.25;
    const random = typeof opts.random === 'function' ? opts.random : Math.random;
    const exponent = Math.max(0, attempt - 1);
    const rawDelay = Math.min(maxMs, baseMs * (2 ** exponent));
    const jitterWindow = rawDelay * jitterRatio;
    const jitter = jitterWindow ? ((random() * 2) - 1) * jitterWindow : 0;
    return Math.round(clamp(rawDelay + jitter, baseMs, maxMs));
  }

  function isHeartbeatStale({ lastHeartbeatAt, now = Date.now(), timeoutMs = 30000 }) {
    if (!lastHeartbeatAt) return true;
    return (now - lastHeartbeatAt) > timeoutMs;
  }

  function shouldResetBackoff({ lastStableAt, now = Date.now(), stableWindowMs = 45000 }) {
    if (!lastStableAt) return false;
    return (now - lastStableAt) >= stableWindowMs;
  }

  function formatRelativeAge(ts, now = Date.now()) {
    if (!ts) return '—';
    const delta = Math.max(0, now - ts);
    if (delta < 1000) return '<1s ago';
    if (delta < 60000) return `${Math.round(delta / 1000)}s ago`;
    return `${Math.round(delta / 60000)}m ago`;
  }

  function getBatteryViewModel({ label, battery, lowThreshold = 20 }) {
    if (!battery || typeof battery.level !== 'number') {
      return { visible: false, label, text: 'Unavailable', charge: '', color: 'var(--dim)', fillWidth: '0%', low: false, warning: '' };
    }

    const level = clamp(Math.round(battery.level), 0, 100);
    const color = level > 50 ? 'var(--green)' : level > lowThreshold ? 'var(--yellow)' : 'var(--red)';
    return {
      visible: true,
      label,
      text: `${level}%`,
      charge: battery.charging ? '⚡' : '',
      color,
      fillWidth: `${level}%`,
      low: level <= lowThreshold,
      warning: level <= lowThreshold ? 'Low battery' : '',
    };
  }

  return {
    RECEIVER_STATES,
    calculateReconnectDelay,
    isHeartbeatStale,
    shouldResetBackoff,
    formatRelativeAge,
    getBatteryViewModel,
  };
}));
