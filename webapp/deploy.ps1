
#  [ ] 1.1.2: add command to update web assets in S3 [docs](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html)
aws s3 cp . s3://webapp-py-webappbucketa26a0839-1pfiy94uokgrg --recursive

#  [ ] 1.2.2: add command to invalidate cloudfront distribution [docs](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html)
aws cloudfront create-invalidation --distribution-id E1U4BVJGRRZ4S2 --paths '/*'
