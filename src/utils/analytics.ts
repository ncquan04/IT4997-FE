const ANON_ID_KEY = "_auid";
const SESSION_ID_KEY = "_sid";
const FLUSH_INTERVAL = 10_000; // 10s
const MAX_BATCH = 20;

let eventBuffer: EventPayload[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

interface EventPayload {
  anonymousId: string;
  sessionId: string;
  userId?: string | null;
  eventName: string;
  params: Record<string, any>;
  page: string;
  referrer: string;
  timestamp: number;
}

// ─── Identity Management ─────────────────────────────────────────────────────

function getAnonymousId(): string {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

// userId can be set after login
let _userId: string | null = null;

export function setAnalyticsUserId(userId: string | null) {
  _userId = userId;
  // When user logs in, fire an identify event to link anonymous → user
  if (userId) {
    logEvent("identify", { userId });
  }
}

// ─── Core logEvent ───────────────────────────────────────────────────────────

export function logEvent(eventName: string, params?: Record<string, any>) {
  const payload: EventPayload = {
    anonymousId: getAnonymousId(),
    sessionId: getSessionId(),
    userId: _userId,
    eventName,
    params: params || {},
    page: window.location.pathname,
    referrer: document.referrer,
    timestamp: Date.now(),
  };

  eventBuffer.push(payload);

  if (eventBuffer.length >= MAX_BATCH) {
    flushEvents();
  }
}

// ─── Flush ───────────────────────────────────────────────────────────────────

function flushEvents() {
  if (eventBuffer.length === 0) return;

  const batch = eventBuffer.splice(0, MAX_BATCH);
  const body = JSON.stringify({ events: batch });

  const url =
    (import.meta.env?.VITE_ENDPOINT ||
      import.meta.env?.VITE_API_BASE_URL ||
      "http://localhost:4000/api") + "/events/track";

  // Use Beacon API for reliability (works even when tab is closing)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // silently fail - analytics should never break the app
    });
  }
}

// ─── Auto-flush setup ────────────────────────────────────────────────────────

export function initAnalytics() {
  if (flushTimer) return;

  // Periodic flush
  flushTimer = setInterval(flushEvents, FLUSH_INTERVAL);

  // Flush on page unload
  window.addEventListener("beforeunload", flushEvents);

  // Flush on visibility change (user switches tab)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushEvents();
    }
  });
}

export function destroyAnalytics() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flushEvents();
}
