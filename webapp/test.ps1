Start-Job -Name webserver -ScriptBlock { http-server.cmd }

Set-Location ..
npx cypress run
Set-Location webapp

Stop-Job -Name webserver