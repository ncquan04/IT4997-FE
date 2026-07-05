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

let _userId: string | null = null;

export function setAnalyticsUserId(userId: string | null) {
  _userId = userId;
  // if (userId) {
  //   logEvent("identify", { userId });
  // }
}

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

function flushEvents() {
  if (eventBuffer.length === 0) return;

  const batch = eventBuffer.splice(0, MAX_BATCH);
  const body = JSON.stringify({ events: batch });

  const base = (
    import.meta.env?.VITE_ENDPOINT ||
    import.meta.env?.VITE_API_BASE_URL ||
    "http://localhost:4000"
  )
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");
  const url = `${base}/api/events/track`;

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }
}

export function initAnalytics() {
  if (flushTimer) return;

  flushTimer = setInterval(flushEvents, FLUSH_INTERVAL);

  window.addEventListener("beforeunload", flushEvents);

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
