import {
    Stack,
    StackProps,
    aws_dynamodb as DynamoDB,
    aws_lambda as Lambda,
    aws_iam as IAM,
    aws_apigateway as ApiGateway,
    aws_ec2 as EC2,
    CfnOutput,
    Fn,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class RestApiStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)


        // [import value](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_core.Fn.html#static-importwbrvaluesharedvaluetoimport)
        // [ ] 3.1.2: connect api to dynamodb [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-dynamodb.Table.html#static-fromwbrtablewbrarnscope-id-tablearn)
        const ordersTableArn = Fn.importValue('ordersTableArn')
        const ordersTable = DynamoDB.Table.fromTableArn(this, 'ordersTable', ordersTableArn)


        // [ ] 2.1.1: create lambdas for getOrders [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
        const getOrdersLambda = new Lambda.Function(this, 'getOrders', {
            runtime: Lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: Lambda.Code.fromAsset('../functions/get-orders'),// [ ] check the deployment, is this needed here
            environment: { ORDERS_TABLE: ordersTable.tableName }
        })
        new CfnOutput(this, 'getOrdersLambda', {
            value: getOrdersLambda.functionName,
            exportName: 'getOrdersLambda'
        })

        // [ ] 2.1.2: create lambdas for createOrder [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
        const createOrderLambda = new Lambda.Function(this, 'createOrder', {
            runtime: Lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: Lambda.Code.fromAsset('../functions/create-order'),
            environment: { ORDERS_TABLE: ordersTable.tableName }
        })
        new CfnOutput(this, 'createOrderLambda', {
            value: createOrderLambda.functionName,
            exportName: 'createOrderLambda'
        })

        // [ ] 2.1.3: create lambdas for updateOrder [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
        const updateOrderLambda = new Lambda.Function(this, 'updateOrder', {
            runtime: Lambda.Runtime.NODEJS_14_X,
            handler: 'index.handler',
            code: Lambda.Code.fromAsset('../functions/update-order'),
            environment: { ORDERS_TABLE: ordersTable.tableName }
        })
        new CfnOutput(this, 'updateOrderLambda', {
            value: updateOrderLambda.functionName,
            exportName: 'updateOrderLambda'
        })

        // [ ] can we do this importing an OpenAPI file 

        // [ ] 2.2.1: create api [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-apigateway.RestApi.html)
        const api = new ApiGateway.RestApi(this, 'ordersApi', {
            description: 'handle api calls from webapp',
            deployOptions: { stageName: 'dev' },
            defaultCorsPreflightOptions: {
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'Access-Control-Allow-Headers',
                    "Access-Control-Allow-Origin",
                    "Access-Control-Allow-Methods",
                ],
                allowOrigins: ApiGateway.Cors.ALL_ORIGINS,
                allowMethods: ApiGateway.Cors.ALL_METHODS,
                allowCredentials: true,
            }
        })

        // export api value so it can be called by other stacks
        new CfnOutput(this, 'apiUrl', {
            value: api.url,
            exportName: 'apiUrl'
        })

        // const corsPreflight = {
        //     allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        //     allowMethods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        //     allowCredentials: true,
        //     allowOrigins: ['http://localhost:3000'],
        // }

        // [ ] 2.2.2: create /orders resource [POST, GET] [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-apigateway.IResource.html#addwbrmethodhttpmethod-target-options)
        const ordersEndpoint = api.root.addResource('orders')
        ordersEndpoint.addMethod('GET', new ApiGateway.LambdaIntegration(getOrdersLambda, { proxy: true }))
        ordersEndpoint.addMethod('POST', new ApiGateway.LambdaIntegration(createOrderLambda, { proxy: true }))

        // ordersEndpoint.addCorsPreflight(corsPreflight)

        // [ ] 2.2.3: create /orders/{customer}/{id} [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-apigateway.IResource.html#addwbrresourcepathpart-options)
        const singleOrderEndpoint = ordersEndpoint.addResource('{customer}').addResource('{id}')
        singleOrderEndpoint.addMethod('PATCH', new ApiGateway.LambdaIntegration(updateOrderLambda, { proxy: true }))



        // this way to handle apis created by ClaudiaJS
        // const lambdaRole = IAM.Role.fromRoleName(this, 'lambdaRole', apiConfig.lambda.role)
        // ordersTable.grantReadWriteData(lambdaRole)

        // this way to add access directly on lambda function
        ordersTable.grantReadWriteData(createOrderLambda)
        ordersTable.grantReadWriteData(getOrdersLambda)
        ordersTable.grantReadWriteData(updateOrderLambda)


        // const boundary1 = new IAM.ManagedPolicy(this, 'permissions-boundary-ECS', {
        //     statements: [
        //         new IAM.PolicyStatement({
        //             effect: IAM.Effect.DENY,
        //             actions: ['ECS:*'],
        //             resources: ['*'],
        //         }),
        //     ],
        // })

        // if (getOrdersLambda.role) 
        //     IAM.PermissionsBoundary.of(getOrdersLambda.role).apply(boundary1)

        // if (createOrderLambda.role) 
        //     IAM.PermissionsBoundary.of(createOrderLambda.role).apply(boundary1)

        // if (updateOrderLambda.role) 
        //     IAM.PermissionsBoundary.of(updateOrderLambda.role).apply(boundary1)
    }
}
