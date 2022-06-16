# Serverless E2E



**Index:**
1. **Webapp:**
    1. **Hosting (S3):** where to store app assets?
        1. [x] create CDK code for bucket
        2. [x] add re upload assets to bucket on pipeline
    2. **CDN (CloudFront):** How to distribute assets across the globe?
        1. [x] create CDK distribution
        2. [x] add invalidate cache on pipeline
    3. **DNS (Route53):** how to set up DNS? -- optional
        1. [ ] create CDK record set (optional, we may not have access to a domain)
2. **REST API:**
    1. **API (ClaudiaJS):**
       1. [x] create api and respective resources
       2. [x] /orders with [POST, PATCH, GET]
3. **Database:**
   1. **DynamoDB:**
      1. [ ] desing table based on access patterns
      2. [ ] create CDK code for dynamodb table
- [ ] grant api lamda access to dyna modb table
4. **Backend processes:**
   1. **Infrastructure as code (CDK and CloudFormation):**
      1. [ ] orders table (dynamo)
      2. [ ] processing orders queue (sqs)
      3. [ ] user notification (sns)
   2.  **Queued orders:** Chalice (python)
       1. [ ] create a lambda triggered by sqs
       2. [ ] create a lambda triggered by dynamo that nofify users using sns
5. **Security:**
   1. **Web App Access Control (Cognito):** How to secure app?
      1. [ ] create CDK user pool and hosted UI
      2. [ ] create a Cognito hosted UI for this application
   2. **API Access Control (Cognito authorizer):**
      1. [ ] create the cognito authorizer
      2. [ ] add authorizer to private endpoints

