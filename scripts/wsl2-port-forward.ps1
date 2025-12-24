# WSL2 Port Forwarding Script for Windows
# Run this in PowerShell as Administrator on Windows 11

$ports = @(3000, 4000)
$wslIP = (wsl hostname -I).Trim()

Write-Host "WSL2 IP Address: $wslIP"

foreach ($port in $ports) {
    Write-Host "Forwarding port $port..."

    # Remove existing rule if it exists
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 | Out-Null

    # Add new forwarding rule
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIP

    # Add firewall rule
    $ruleName = "WSL2 CodeQuest Port $port"
    Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Out-Null
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow | Out-Null

    Write-Host "Port $port forwarded successfully"
}

Write-Host "`nCurrent port forwarding rules:"
netsh interface portproxy show v4tov4

Write-Host "`nTo remove these rules later, run:"
Write-Host "netsh interface portproxy reset"
