/**
 * Terminal WebSocket connection - TRUE singleton that initializes on import.
 * Lives completely outside of React lifecycle.
 * Survives HMR by storing state and WebSocket on window.
 */

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
}

type MessageHandler = (data: ArrayBuffer | string) => void;
type StatusHandler = (status: ConnectionStatus) => void;

interface TerminalState {
  ws: WebSocket | null;
  status: ConnectionStatus;
  messageHandlers: Set<MessageHandler>;
  statusHandlers: Set<StatusHandler>;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  keepAliveTimer: ReturnType<typeof setInterval> | null;
  connectTimeoutTimer: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
  connectLock: boolean;
  shouldConnect: boolean;
}

function getTerminalWsUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const configured = (process.env.NEXT_PUBLIC_TERMINAL_WS_URL || '').trim();
  const defaultPath = '/api/terminal';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

  if (configured) {
    let url = configured;
    if (url.startsWith('http://')) url = `ws://${url.slice('http://'.length)}`;
    if (url.startsWith('https://')) url = `wss://${url.slice('https://'.length)}`;

    if (url.startsWith('ws://') || url.startsWith('wss://')) {
      const hasPath = url.replace(/^wss?:\/\/[^/]+/, '').length > 0;
      return hasPath ? url : `${url}${defaultPath}`;
    }

    const withoutSlashes = url.replace(/^\/\//, '');
    const hasPath = withoutSlashes.includes('/');
    return `${protocol}//${withoutSlashes}${hasPath ? '' : defaultPath}`;
  }

  return `${protocol}//${window.location.host}${defaultPath}`;
}

declare global {
  interface Window {
    __TERMINAL_STATE__?: TerminalState;
    __TERMINAL_WS__?: WebSocket; // Direct reference to prevent GC
  }
}

// Get or create global state
function getState(): TerminalState {
  if (typeof window === 'undefined') {
    return {
      ws: null,
      status: ConnectionStatus.DISCONNECTED,
      messageHandlers: new Set(),
      statusHandlers: new Set(),
      reconnectTimer: null,
      keepAliveTimer: null,
      connectTimeoutTimer: null,
      reconnectAttempts: 0,
      connectLock: false,
      shouldConnect: false,
    };
  }

  if (!window.__TERMINAL_STATE__) {
    console.log('[TC] Creating global terminal state');
    window.__TERMINAL_STATE__ = {
      ws: null,
      status: ConnectionStatus.DISCONNECTED,
      messageHandlers: new Set(),
      statusHandlers: new Set(),
      reconnectTimer: null,
      keepAliveTimer: null,
      connectTimeoutTimer: null,
      reconnectAttempts: 0,
      connectLock: false,
      shouldConnect: false,
    };
  }
  return window.__TERMINAL_STATE__!;
}

function hasActiveSubscribers(state: TerminalState) {
  return state.messageHandlers.size > 0 || state.statusHandlers.size > 0;
}

function startKeepAlive(ws: WebSocket) {
  const state = getState();
  if (state.keepAliveTimer) {
    clearInterval(state.keepAliveTimer);
  }
  const sendPing = () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', time: Date.now() }));
    }
  };
  sendPing();
  state.keepAliveTimer = setInterval(sendPing, 25000);
}

function stopKeepAlive() {
  const state = getState();
  if (state.keepAliveTimer) {
    clearInterval(state.keepAliveTimer);
    state.keepAliveTimer = null;
  }
}

function clearConnectTimeout() {
  const state = getState();
  if (state.connectTimeoutTimer) {
    clearTimeout(state.connectTimeoutTimer);
    state.connectTimeoutTimer = null;
  }
}

function setStatus(newStatus: ConnectionStatus) {
  const state = getState();
  if (state.status === newStatus) return;

  console.log(`[TC] Status: ${state.status} -> ${newStatus}`);
  state.status = newStatus;

  state.statusHandlers.forEach(h => {
    try { h(newStatus); } catch (e) { console.error('[TC] Status handler error:', e); }
  });
}

function connect() {
  const state = getState();

  // Prevent concurrent connection attempts
  if (state.connectLock) {
    console.log('[TC] Connection locked, skipping');
    return;
  }

  // Already connected or connecting?
  if (state.ws) {
    if (state.ws.readyState === WebSocket.OPEN) {
      console.log('[TC] Already connected');
      setStatus(ConnectionStatus.CONNECTED);
      return;
    }
    if (state.ws.readyState === WebSocket.CONNECTING) {
      console.log('[TC] Already connecting');
      return;
    }
    // CLOSING/CLOSED - replace it
    console.log(`[TC] Replacing stale WebSocket (readyState=${state.ws.readyState})`);
    state.ws = null;
  }

  // Cancel any pending reconnect since we're connecting now
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }

  state.connectLock = true;

  console.log('[TC] Creating WebSocket connection...');
  setStatus(ConnectionStatus.CONNECTING);

  const wsUrl = getTerminalWsUrl();
  if (!wsUrl) {
    console.log('[TC] No WebSocket URL available');
    state.connectLock = false;
    return;
  }
  const ws = new WebSocket(wsUrl);
  ws.binaryType = 'arraybuffer';
  state.ws = ws;
  window.__TERMINAL_WS__ = ws; // Keep direct reference to prevent GC
  console.log('[TC] WebSocket created and stored on window');
  state.connectTimeoutTimer = setTimeout(() => {
    if (ws.readyState === WebSocket.CONNECTING) {
      console.log('[TC] Connection timeout, closing stale socket');
      try { ws.close(); } catch {}
    }
  }, 5000);

  ws.onopen = () => {
    console.log('[TC] WebSocket opened');
    const s = getState();
    s.connectLock = false;
    clearConnectTimeout();
    if (s.ws !== ws) {
      console.log('[TC] Stale WebSocket opened (s.ws !== ws), closing');
      ws.close();
      return;
    }
    s.reconnectAttempts = 0;
    startKeepAlive(ws);
    try {
      ws.send(JSON.stringify({ type: 'init' }));
    } catch {}
    setStatus(ConnectionStatus.CONNECTED);
    console.log('[TC] WebSocket fully connected and ready');
  };

  ws.onmessage = (e) => {
    const s = getState();
    if (s.ws !== ws) return;
    if (typeof e.data === 'string') {
      try {
        const msg = JSON.parse(e.data);
        if (msg?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', time: msg.time ?? Date.now() }));
          return;
        }
        if (msg?.type === 'pong') {
          return;
        }
      } catch {}
    }
    s.messageHandlers.forEach(h => {
      try { h(e.data); } catch (err) { console.error('[TC] Message handler error:', err); }
    });
  };

  ws.onclose = (e) => {
    console.log(`[TC] WebSocket closed: code=${e.code}`);
    const s = getState();
    s.connectLock = false;
    clearConnectTimeout();

    if (s.ws !== ws) {
      console.log('[TC] Stale WebSocket closed, ignoring');
      return;
    }
    s.ws = null;
    stopKeepAlive();
    if (typeof window !== 'undefined' && window.__TERMINAL_WS__ === ws) {
      window.__TERMINAL_WS__ = undefined;
    }
    setStatus(ConnectionStatus.DISCONNECTED);

    const shouldReconnect = s.shouldConnect || hasActiveSubscribers(s);
    if (!shouldReconnect) {
      console.log('[TC] No active subscribers, staying disconnected');
      s.reconnectAttempts = 0;
      return;
    }

    if (!s.reconnectTimer) {
      s.reconnectAttempts++;
      setStatus(ConnectionStatus.CONNECTING);
      const delay = 1000 * Math.pow(2, Math.min(s.reconnectAttempts - 1, 4));
      console.log(`[TC] Reconnecting in ${delay}ms (attempt ${s.reconnectAttempts})`);
      s.reconnectTimer = setTimeout(() => {
        s.reconnectTimer = null;
        connect();
      }, delay);
    }
  };

  ws.onerror = () => {
    console.log('[TC] WebSocket error');
    stopKeepAlive();
    clearConnectTimeout();
    setStatus(ConnectionStatus.DISCONNECTED);
    getState().connectLock = false;
  };
}

// Public API
export function getTerminalConnection() {
  return {
    send(msg: string) {
      const state = getState();
      if (state.ws?.readyState === WebSocket.OPEN) {
        state.ws.send(msg);
      }
    },

    resize(cols: number, rows: number) {
      const state = getState();
      if (state.ws?.readyState === WebSocket.OPEN && cols > 0 && rows > 0) {
        state.ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    },

    onMessage(handler: MessageHandler) {
      const state = getState();
      state.shouldConnect = true;
      state.messageHandlers.add(handler);
      return () => {
        state.messageHandlers.delete(handler);
        if (state.messageHandlers.size === 0 && state.statusHandlers.size === 0) {
          state.shouldConnect = false;
        }
      };
    },

    onStatus(handler: StatusHandler) {
      const state = getState();
      state.shouldConnect = true;
      state.statusHandlers.add(handler);
      handler(state.status); // Immediate callback
      return () => {
        state.statusHandlers.delete(handler);
        if (state.messageHandlers.size === 0 && state.statusHandlers.size === 0) {
          state.shouldConnect = false;
        }
      };
    },

    isConnected() {
      return getState().status === ConnectionStatus.CONNECTED;
    },

    getStatus() {
      return getState().status;
    },

    ensureConnected() {
      const state = getState();
      state.shouldConnect = true;
      if (state.status === ConnectionStatus.DISCONNECTED) {
        if (state.reconnectTimer) {
          clearTimeout(state.reconnectTimer);
          state.reconnectTimer = null;
        }
        state.reconnectAttempts = 0;
        state.connectLock = false;
      }
      connect();
    },
  };
}
