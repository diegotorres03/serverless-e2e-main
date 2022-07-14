$WebappConfig=Get-Content -Raw -Path '..\webapp.json' | ConvertFrom-Json -Depth 4
$bucketName="s3://" + $WebappConfig.webapp.webappBucketName
$distributionId=$WebappConfig.webapp.distributionId

#  [ ] 1.1.2: add command to update web assets in S3 [docs](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html)

Write-Host 'Uploadin assets to' + $bucketName
aws s3 cp .  $bucketName --recursive


#  [ ] 1.2.2: add command to invalidate cloudfront distribution [docs](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html)
aws cloudfront create-invalidation --distribution-id $distributionId --paths '/*'
