

# test function
# npm run test

# read a json file
$config=Get-Content -Raw -Path '..\backend.json' | ConvertFrom-Json -Depth 4

Write-Output "updating function" $config.backend.dynamoLambda

$exists=Test-Path .\dynamo-handler.zip 
if ($exists) { 
    Remove-Item .\dynamo-handler.zip 
}

Compress-Archive -Path .\*.js -DestinationPath .\dynamo-handler
aws lambda update-function-code --function-name $config.backend.dynamoLambda --zip-file fileb://dynamo-handler.zip