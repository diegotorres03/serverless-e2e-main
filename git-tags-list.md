




1. git tag -a ch1.1.1 -m "create CDK code for bucket"
2. git tag -a ch1.1.2 -m "add re upload assets to bucket on pipeline"
3. git tag -a ch1.2.1 -m "create CDK distribution"
4. git tag -a ch1.2.2 -m "add invalidate cache on pipeline"
5. git tag -a ch2.1.1 -m "create lambda: getOrders"
6. git tag -a ch2.1.2 -m "create lambda: createOrder"
7. git tag -a ch2.1.3 -m "create lambda: updateOrder"
8. git tag -a ch2.2.1 -m "create api"
9. git tag -a ch2.2.2 -m "create /orders [GET, POST]"
10. git tag -a ch2.2.3 -m "create /orders/{customer}/{id} with [PATCH]"
11. git tag -a ch2.3.1 -m "get orders from api"
12. git tag -a ch2.3.2 -m "create new orders using api"
13. git tag -a ch3.1.1 -m "create CDK code for dynamodb table and grant access to lambda"
14. git tag -a ch3.1.2 -m "connect api to dynamodb"
15. git tag -a ch3.2.1 -m "use table on getOrders"
16. git tag -a ch3.2.2 -m "use table on createOrder"
17. git tag -a ch3.2.3 -m "use table on updateOrder"
18. git tag -a ch4.1.1 -m "processing orders queue (sqs)"
19. git tag -a ch4.1.2 -m "user notification (sns)"
20. git tag -a ch4.2.1 -m "dynamo stream (lambda)"
21. git tag -a ch4.2.2 -m "SQS handler (lambda)"
22. git tag -a ch4.3.1 -m "connect a lambda triggered by dynamo that nofify users using sns"
23. git tag -a ch4.3.2 -m "connect a lambda triggered by sqs"
24. git tag -a ch5.1.1 -m "create CDK user pool and hosted UI"