# call all deploy.ps1

# npm run apidoc

Write-Host 'Running infra'
# Set-Location infraestructure
# . .\deploy.ps1
# Set-Location ..

# run test here

Write-Host 'Running webapp'
Set-Location webapp
. .\deploy.ps1
Set-Location ..

# . .\webapp\deploy.ps1
# . .\webapp\deploy.ps1
# . .\webapp\deploy.ps1

