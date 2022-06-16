# Serverless E2E



**Index:**
1. **Webapp:**
    1. **Hosting (S3):** where to store app assets?
        - [ ] create CDK code for bucket
        - [ ] create npm command to build 
            - [ ] upload /dist/app to S3
            - [ ] invalidate CDN cache
    2. **CDN (CloudFront):** How to distribute assets across the globe?
        - [ ] create CDK distribution
    3. **DNS (Route53):** how to set up DNS?
        - [ ] create CDK record set (optional, we may not have access to a domain)
    4. 
2. **REST API:**
    1. **API (ClaudiaJS):**
       - [ ] create api and respective resources
       - [ ] /orders with [POST, PATCH, GET]
3. **Database:**
   1. **DynamoDB:**
      - [ ] desing table based on access patterns
      - [ ] create CDK code for dynamodb table
- [ ] grant api lamda access to dyna modb table
4. **Backend processes:**
   1. **Infrastructure as code (CDK and CloudFormation):**
      - [ ] orders table (dynamo)
      - [ ] processing orders queue (sqs)
      - [ ] user notification (sns)
   2.  **Queued orders:** Chalice (python)
       - [ ] create a lambda triggered by sqs
       - [ ] create a lambda triggered by dynamo that nofify users using sns
5. **Security:**
   1. **Web App Access Control (Cognito):** How to secure app?
      - [ ] create CDK user pool and hosted UI
      - [ ] create a Cognito hosted UI for this application
   2. **API Access Control (Cognito authorizer):**
      - [ ] create the cognito authorizer
      - [ ] add authorizer to private endpoints