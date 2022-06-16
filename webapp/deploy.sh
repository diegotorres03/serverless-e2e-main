
#  [ ] TODO: add command to update web assets in S3
aws s3 cp index.html s3://webappstack-webappartifact89ba74f3-vmxg3arm76w7

#  [ ] TODO: add command to invalidate cloudfront distribution
aws cloudfront create-invalidation --distribution-id E342KBZTJW1GT0 --paths '/*'
