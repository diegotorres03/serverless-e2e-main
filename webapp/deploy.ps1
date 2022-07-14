
#  [ ] 1.1.2: add command to update web assets in S3 [docs](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html)
aws s3 cp . s3://webapp-webappartifact89ba74f3-f3lsmkokb0hw --recursive

#  [ ] 1.2.2: add command to invalidate cloudfront distribution [docs](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html)
aws cloudfront create-invalidation --distribution-id E3ON6CC6RA68P6 --paths '/*'
