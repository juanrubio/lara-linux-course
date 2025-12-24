# Running CodeQuest Academy in WSL2

If you're running this application in WSL2 (Windows Subsystem for Linux 2) on Windows 11, follow these instructions.

## Quick Start

From within WSL2 Ubuntu, run:

```bash
./scripts/dev-localhost.sh
```

This script will:
- Clear the Next.js cache to remove any stale environment variables
- Explicitly set the WebSocket URL to `ws://localhost:4000/api/terminal`
- Start both servers with the correct configuration

Then open your browser on Windows and go to `http://localhost:3000`

## How It Works

- WSL2 automatically forwards `localhost` ports from Windows to WSL2
- Both the web server (port 3000) and terminal WebSocket server (port 4000) are accessible via `localhost`
- The servers bind to `0.0.0.0` to ensure they're accessible from the Windows host

## Troubleshooting

### Terminal says "Connecting..." and never connects

**Check if port 4000 is accessible from Windows:**

Open PowerShell on Windows and run:
```powershell
Test-NetConnection -ComputerName localhost -Port 4000
```

If this fails:

1. **Restart WSL2** - Sometimes port forwarding needs a restart:
   ```powershell
   wsl --shutdown
   ```
   Then restart your WSL2 terminal.

2. **Manual Port Forwarding** - If automatic forwarding doesn't work, use the provided script:

   Open PowerShell **as Administrator** on Windows and run:
   ```powershell
   # From Windows, in the project directory:
   ./scripts/wsl2-port-forward.ps1
   ```

3. **Check Windows Firewall** - Ensure Windows Firewall isn't blocking ports 3000 and 4000:
   ```powershell
   New-NetFirewallRule -DisplayName "WSL2 Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "WSL2 Port 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
   ```

### Verify servers are running

Inside WSL2, check if both servers are listening:
```bash
ss -tlnp | grep -E "(3000|4000)"
```

You should see:
```
LISTEN 0      511          0.0.0.0:4000       0.0.0.0:*
LISTEN 0      511          0.0.0.0:3000       0.0.0.0:*
```

## Development Scripts

- `./scripts/dev-localhost.sh` - **Recommended for WSL2** - Explicitly uses `localhost` and clears cache
- `./scripts/dev.sh` - Basic local development script
- `./scripts/dev-lan.sh` - LAN access (uses your IP address)

For WSL2, **always use `dev-localhost.sh`** since you're accessing from the Windows host.
