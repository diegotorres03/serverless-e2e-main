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
       1. [x] create CDK code for dynamodb table and grant access to lambda
       2. [x] connect api to dynamodb
4. **Backend processes:**
   1. **Infrastructure:**
       1. [ ] processing orders queue (sqs)
       2. [ ] user notification (sns)
       3. [ ] dynamo stream (lambda)
       4. [ ] SQS handler (lamda)
   2.  **assign handlers:** Chalice (python)
       1. [ ] connect a lambda triggered by sqs
       2. [ ] connect a lambda triggered by dynamo that nofify users using sns
5.  **Security:**
    1. **Web App Access Control (Cognito):** How to secure app?
       1. [ ] create CDK user pool and hosted UI
       2. [ ] create a Cognito hosted UI for this application
    2. **API Access Control (Cognito authorizer):**
       1. [ ] create the cognito authorizer
       2. [ ] add authorizer to private endpoints