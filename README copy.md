# Serverless E2E



**Index:**
1. **Webapp:**
    1. **DNS (Route53):** how to set up DNS?
        1. [x] create CDK record set (optional, we may not have access to a domain)
    2. **CDN (CloudFront):** How to distribute assets across the globe?
        1. [x] create CDK distribution
    3. **Hosting (S3):** where to store app assets?
        1. [x] create CDK code for bucket
        2. [x] create npm command to build 
            1. ng build
            2. upload /dist/app to S3
            3. invalidate CDN cache
    4. **Access Control (Cognito):** How to secure app?
        1. Cognito hosted UI.
            1. [x] create CDK user pool and hosted UI
        2. Handled by app.
            1. mention how custom auth might be implemented


2. **REST API:**
    1. **API (ClaudiaJS):**
       1. [x] create api and respective envs
       2. [x] /orders with [POST, PATCH, GET]
    2. **API Access Control (Cognito authorizer):**
       1. [ ] create the cognito authorizer
       2. [ ] add authorizer to private endpoints
    3. **Infrastructure as code (CDK and CloudFormation):**
       1. [ ] orders table (dynamo)
       2. [ ] processing orders queue (sqs)
       3. [ ] user notification (sns)
    4. **Queued orders:** Chalice (python)
       1. [ ] create a lambda triggered by sqs
       2. [ ] create a lambda triggered by dynamo that nofify users using sns
   
3. **Database:**
    1. **DynamoDB:** Powerful Key Value store 
    2. **Neptune:** create graphs and networks
    3. **TimeStream:** time series store

4. **Analytics:**
    1. 

5. **Observability:**
    1. Cloud Watch stack:
        1. logs
        2. logs insights
        3. x-rays