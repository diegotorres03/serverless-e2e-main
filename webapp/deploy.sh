
#  [ ] 1.1.2: add command to update web assets in S3 [docs](https://docs.aws.amazon.com/cli/latest/reference/s3/index.html)
aws s3 cp index.html s3://webappstack-webappartifact89ba74f3-vmxg3arm76w7

#  [ ] 1.2.2: add command to invalidate cloudfront distribution
aws cloudfront create-invalidation --distribution-id E342KBZTJW1GT0 --paths '/*'
