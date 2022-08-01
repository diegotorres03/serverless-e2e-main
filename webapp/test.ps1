Start-Job -Name webserver -ScriptBlock { http-server.cmd }

npx cypress run

Stop-Job -Name webserver