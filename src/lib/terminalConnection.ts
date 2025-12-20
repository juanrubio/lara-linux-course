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
  reconnectAttempts: number;
  connectLock: boolean;
  lastConnectTime: number;
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
      reconnectAttempts: 0,
      connectLock: false,
      lastConnectTime: 0,
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
      reconnectAttempts: 0,
      connectLock: false,
      lastConnectTime: 0,
    };
  }
  return window.__TERMINAL_STATE__!;
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
  const now = Date.now();

  // Debounce: don't connect more than once per 500ms
  if (now - state.lastConnectTime < 500) {
    console.log('[TC] Debouncing connection attempt');
    return;
  }

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

  if (state.reconnectAttempts >= 5) {
    console.log('[TC] Max reconnect attempts reached');
    return;
  }

  // Cancel any pending reconnect since we're connecting now
  if (state.reconnectTimer) {
    clearTimeout(state.reconnectTimer);
    state.reconnectTimer = null;
  }

  state.connectLock = true;
  state.lastConnectTime = now;

  console.log('[TC] Creating WebSocket connection...');
  setStatus(ConnectionStatus.CONNECTING);

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}/api/terminal`);
  ws.binaryType = 'arraybuffer';
  state.ws = ws;
  window.__TERMINAL_WS__ = ws; // Keep direct reference to prevent GC
  console.log('[TC] WebSocket created and stored on window');

  ws.onopen = () => {
    console.log('[TC] WebSocket opened');
    const s = getState();
    s.connectLock = false;
    if (s.ws !== ws) {
      console.log('[TC] Stale WebSocket opened (s.ws !== ws), closing');
      ws.close();
      return;
    }
    s.reconnectAttempts = 0;
    setStatus(ConnectionStatus.CONNECTED);
    console.log('[TC] WebSocket fully connected and ready');
  };

  ws.onmessage = (e) => {
    const s = getState();
    if (s.ws !== ws) return;
    s.messageHandlers.forEach(h => {
      try { h(e.data); } catch (err) { console.error('[TC] Message handler error:', err); }
    });
  };

  ws.onclose = (e) => {
    console.log(`[TC] WebSocket closed: code=${e.code}`);
    const s = getState();
    s.connectLock = false;

    if (s.ws !== ws) {
      console.log('[TC] Stale WebSocket closed, ignoring');
      return;
    }
    s.ws = null;
    setStatus(ConnectionStatus.DISCONNECTED);

    // Only schedule reconnect for unexpected closes (not 1000=normal, 1001=going away)
    if (e.code !== 1000 && e.code !== 1001 && !s.reconnectTimer) {
      s.reconnectAttempts++;
      const delay = 1000 * Math.pow(2, Math.min(s.reconnectAttempts - 1, 4));
      console.log(`[TC] Reconnecting in ${delay}ms (attempt ${s.reconnectAttempts})`);
      s.reconnectTimer = setTimeout(() => {
        s.reconnectTimer = null;
        connect();
      }, delay);
    } else if (e.code === 1001) {
      console.log('[TC] Navigation close detected, will reconnect on demand');
      // Reset reconnect attempts for navigation
      s.reconnectAttempts = 0;
    }
  };

  ws.onerror = () => {
    console.log('[TC] WebSocket error');
    getState().connectLock = false;
  };
}

// Auto-connect on module load (client-side only)
// This ensures the connection is established early and survives component lifecycle
if (typeof window !== 'undefined') {
  // Use a longer delay to ensure the page is fully loaded
  setTimeout(() => {
    const state = getState();
    // Only connect if not already connected/connecting and no pending reconnect
    if (state.status === ConnectionStatus.DISCONNECTED && !state.ws && !state.connectLock && !state.reconnectTimer) {
      console.log('[TC] Auto-connecting on module load');
      connect();
    } else {
      console.log(`[TC] Skipping auto-connect: status=${state.status}, ws=${!!state.ws}, lock=${state.connectLock}, timer=${!!state.reconnectTimer}`);
    }
  }, 300);
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
      state.messageHandlers.add(handler);
      return () => state.messageHandlers.delete(handler);
    },

    onStatus(handler: StatusHandler) {
      const state = getState();
      state.statusHandlers.add(handler);
      handler(state.status); // Immediate callback
      return () => state.statusHandlers.delete(handler);
    },

    isConnected() {
      return getState().status === ConnectionStatus.CONNECTED;
    },

    getStatus() {
      return getState().status;
    },

    ensureConnected() {
      connect();
    },
  };
}
