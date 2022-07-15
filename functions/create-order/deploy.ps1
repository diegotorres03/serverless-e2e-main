
# read a json file
$config=Get-Content -Raw -Path '..\api.json' | ConvertFrom-Json -Depth 4

Write-Output "updating function" $config.api.createOrderLambda

$exists=Test-Path .\create-order.zip 
if ($exists) { 
    Remove-Item .\create-order.zip 
}

Compress-Archive -Path .\ -DestinationPath .\create-order
aws lambda update-function-code --function-name $config.api.createOrderLambda --zip-file fileb://create-order.zip