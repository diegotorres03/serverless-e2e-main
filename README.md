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
    1. **handlers**
       1. [x] create lambda: getOrders
       2. [x] create lambda: createOrder 
       3. [x] create lambda: updateOrder
    2. **API (CDK/ClaudiaJS):**
       1. [x] create api
       2. [x] create /orders [GET, POST]
       3. [x] create /orders/{customer}/{id} with [PATCH]
    3. **webapp**
       1. [x] get orders from api
       2. [x] create new orders using api
3. **Database:**
    1. **DynamoDB:**
       1. [x] create CDK code for dynamodb table and grant access to lambda
       2. [x] connect api to dynamodb
    2. **handlers:**
       1. [x] use table on getOrders
       2. [x] use table on createOrder
       3. [x] use table on updateOrder
4. **Backend processes:**
    1. **app integration:**
       1. [x] processing orders queue (sqs)
       2. [x] user notification (sns)
    2. **Handlers** 
       1. [x] dynamo stream (lambda)
       2. [x] SQS handler (lambda)
    3. **assign handlers:** 
       1. [x] connect a lambda triggered by dynamo that nofify users using sns
       2. [x] connect a lambda triggered by sqs
5.  **Security:**
    1. **Web App Access Control (Cognito):** How to secure app?
       1. [ ] create CDK user pool and hosted UI
       2. [ ] create a Cognito hosted UI for this application
    2. **API Access Control (Cognito authorizer):**
       1. [ ] create the cognito authorizer
       2. [ ] add authorizer to private endpoints