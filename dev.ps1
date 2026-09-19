$env:Path = "C:\Program Files\nodejs;" + $env:Path
Set-Location $PSScriptRoot

function Stop-Port {
  param([int]$Port)
  try {
    $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
  } catch {
    return
  }

  foreach ($conn in $connections) {
    $processId = $conn.OwningProcess
    if ($processId -and $processId -ne 0) {
      Write-Host "Stopping process $processId on port $Port"
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
}

if ($args -contains "-clean" -or $args -contains "--clean") {
  Stop-Port 3000
  Stop-Port 3001
  if (Test-Path .next) {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    if (Test-Path .next) {
      cmd /c "rmdir /s /q .next" 2>$null
    }
    Write-Host "Cleared .next cache"
  }
}

npm run dev
