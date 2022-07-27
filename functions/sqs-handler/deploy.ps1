
npm i

# test function
npm run test

# read a json file
$config=Get-Content -Raw -Path '..\backend.json' | ConvertFrom-Json -Depth 4

Write-Output "updating function" $config.backend.sqsLambda

$exists=Test-Path .\create-order.zip 
if ($exists) { 
    Remove-Item .\create-order.zip 
}

Compress-Archive -Path .\*.js -DestinationPath .\sqs-handler
aws lambda update-function-code --function-name $config.backend.sqsLambda --zip-file fileb://sqs-handler.zip