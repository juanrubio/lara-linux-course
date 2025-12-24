'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [info, setInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    setInfo({
      'window.location.href': window.location.href,
      'window.location.host': window.location.host,
      'window.location.protocol': window.location.protocol,
      'NEXT_PUBLIC_TERMINAL_WS_URL': process.env.NEXT_PUBLIC_TERMINAL_WS_URL || '(not set)',
    });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Info</h1>
      <h2>Environment Variables</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
        {JSON.stringify(info, null, 2)}
      </pre>

      <h2>Test WebSocket Connection</h2>
      <button
        onClick={() => {
          const wsUrl = process.env.NEXT_PUBLIC_TERMINAL_WS_URL || 'ws://localhost:4000/api/terminal';
          console.log('Attempting to connect to:', wsUrl);
          const ws = new WebSocket(wsUrl);
          ws.onopen = () => console.log('✅ WebSocket connected successfully!');
          ws.onerror = (e) => console.error('❌ WebSocket error:', e);
          ws.onclose = (e) => console.log('WebSocket closed:', e.code, e.reason);
        }}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Test WS Connection
      </button>

      <p>Open browser console (F12) to see connection logs</p>
    </div>
  );
}
