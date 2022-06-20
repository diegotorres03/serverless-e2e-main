import {
  Stack,
  StackProps,
  aws_s3 as S3,
  aws_s3_deployment as S3Deployment,
  aws_cloudfront as CloudFront,
  aws_cloudfront_origins as CloudFrontOrigins,
  aws_dynamodb as DynamoDB,
  aws_lambda as Lambda,
  aws_lambda_event_sources as LambdaEventSources,
  aws_iam as IAM,
  aws_apigateway as ApiGateway,
  // aws_apigatewayv2 as ApiGateway2,
  aws_sqs as SQS,
  aws_sns as SNS,
  CfnOutput,
  Fn,
  Duration,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as apiConfig from '../../api/claudia.json'

export class InfraestructureStack extends Stack {
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // [x] 4.1.1: create processing orders queue
    const ordersQueue = new SQS.Queue(this, 'ordersQueue', {
      visibilityTimeout: Duration.seconds(60)
    })

    // [x] 4.1.2: create user notification topic (sns)
    const userNotificationTopic = new SNS.Topic(this, 'userNotification')

    // [x] 4.1.3: create a lambda to handle dynamodb stream
    const dynamoLambda = new Lambda.Function(this, 'dynamoHandler', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      code: Lambda.Code.fromAsset('../functions/dynamo-handler'),
      handler: 'index.handler',
      environment: { QUEUE: ordersQueue.queueUrl }
    })

    // [x] 4.1.4: create a lambda to handle sqs messages
    const sqsLambda = new Lambda.Function(this, 'sqsHandler', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      code: Lambda.Code.fromAsset('../functions/sqs-handler'),
      handler: 'index.handler',
      environment: { QUEUE: ordersQueue.queueUrl }
    })

    // const ordersTableArn = Fn.importValue('ordersTableArn')
    // console.log('ordersTableArn', ordersTableArn.toString())
    // const ordersTable = DynamoDB.Table.fromTableArn(this, 'ordersTable', ordersTableArn)
    // console.log('ordersTable.tableStreamArn?.toString()', ordersTable.tableStreamArn?.toString())
    // [x] TODO: create DynamoDB orders table
    const ordersTable = new DynamoDB.Table(this, 'orders', {
      partitionKey: { name: 'customer', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
      billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
      stream: DynamoDB.StreamViewType.NEW_AND_OLD_IMAGES,
    })


    // [x] 4.2.1: set lambda 4.3.1 as handler for dynamodb table updates
    // allow lambda to publish messages on queue
    ordersQueue.grantSendMessages(dynamoLambda)
    
    // allow lambda to read dynamo stream 
    ordersTable.grantStreamRead(dynamoLambda)
    
    // add ordersTable as source for lambda
    dynamoLambda.addEventSource(new LambdaEventSources.DynamoEventSource(ordersTable, {
      startingPosition: Lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 1,
    }))

    // [x] 4.2.2: set lambda 4.1.4 as handler for sqs queue messages
    sqsLambda.addEventSource(new LambdaEventSources.SqsEventSource(ordersQueue, {
      batchSize: 2,
    }))

  }
}

export class RestApiStack extends Stack {
  public readonly ordersTable: DynamoDB.Table
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // [x] create API Gateway
    const api = new ApiGateway.RestApi(this, 'orders-api', {
      description: 'handle api calls from webapp',
      deployOptions: { stageName: 'dev' },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowOrigins: ['*'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
      }
    })

    new CfnOutput(this, 'apiUrl', {
      value: api.url,
      exportName: 'apiUrl'
    })


    // [x] TODO: create DynamoDB orders table
    this.ordersTable = new DynamoDB.Table(this, 'orders', {
      partitionKey: { name: 'customer', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
      billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
      stream: DynamoDB.StreamViewType.NEW_AND_OLD_IMAGES,
    })


    // [x] create lambdas [getOrders, createOrder, updateOrder]
    const getOrdersLambda = new Lambda.Function(this, 'getOrders', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Lambda.Code.fromAsset('../functions/get-orders'),
      environment: { ORDERS_TABLE: this.ordersTable.tableName }
    })


    const createOrderLambda = new Lambda.Function(this, 'createOrder', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Lambda.Code.fromAsset('../functions/create-order'),
      environment: { ORDERS_TABLE: this.ordersTable.tableName }
    })


    const updateOrderLambda = new Lambda.Function(this, 'updateOrder', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Lambda.Code.fromAsset('../functions/update-order'),
      environment: { ORDERS_TABLE: this.ordersTable.tableName }
    })

    // ch1.2.1 [x] create /orders resource [POST, GET]
    const ordersEndpoint = api.root.addResource('orders')
    ordersEndpoint.addMethod('GET', new ApiGateway.LambdaIntegration(getOrdersLambda, { proxy: true }))
    ordersEndpoint.addMethod('POST', new ApiGateway.LambdaIntegration(createOrderLambda, { proxy: true }))


    // [x] create /orders/{customer}/{id}
    const singleOrderEndpoint = ordersEndpoint.addResource('{customer}').addResource('{id}')
    singleOrderEndpoint.addMethod('PATCH', new ApiGateway.LambdaIntegration(updateOrderLambda, { proxy: true }))



    // this way to handle apis created by ClaudiaJS
    // const lambdaRole = IAM.Role.fromRoleName(this, 'lambdaRole', apiConfig.lambda.role)
    // this.ordersTable.grantReadWriteData(lambdaRole)

    // this way to add access directly on lambda function
    this.ordersTable.grantReadWriteData(createOrderLambda)
    this.ordersTable.grantReadWriteData(getOrdersLambda)
    this.ordersTable.grantReadWriteData(updateOrderLambda)

    new CfnOutput(this, 'ordersTableName', {
      value: this.ordersTable.tableName,
      exportName: 'ordersTableName'
    })

    new CfnOutput(this, 'ordersTableArn', {
      value: this.ordersTable.tableArn,
      exportName: 'ordersTableArn'
    })

  }
}

export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    // [x] TODO: create S3 Bucket as web hosting to store webapp [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-s3-readme.html)
    const webappBucket = new S3.Bucket(this, 'webapp-artifact', {
      accessControl: S3.BucketAccessControl.PRIVATE,
      cors: [{
        allowedMethods: [S3.HttpMethods.GET],
        allowedOrigins: ['*'],

        // the properties below are optional
        allowedHeaders: ['Authorization'],
        exposedHeaders: [],
      }],
    })

    const webappDeployment = new S3Deployment.BucketDeployment(this, 'deployStaticWebapp', {
      sources: [S3Deployment.Source.asset('../webapp')],
      destinationBucket: webappBucket,
    })


    // [x] TODO: create CloudFront distribution [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html)
    const originAccessIdentity = new CloudFront.OriginAccessIdentity(this, 'OriginAccessIdentity')

    // allow clowdfront to read s3 webpp files
    webappBucket.grantRead(originAccessIdentity)

    const cdnDistribution = new CloudFront.Distribution(this, 'WebappDistribution', {
      defaultRootObject: 'index.html',

      defaultBehavior: {
        origin: new CloudFrontOrigins.S3Origin(webappBucket, { originAccessIdentity })
      }
    })


    // [o] TODO: create Route 53 record set [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-route53-readme.html)

    // [x] TODO: create DynamoDB orders table
    // const ordersTable = new DynamoDB.Table(this, 'orders', {
    //   partitionKey: { name: 'customer', type: DynamoDB.AttributeType.STRING },
    //   sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
    //   billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
    // })

    // const lambdaRole = IAM.Role.fromRoleName(this, 'lambdaRole', apiConfig.lambda.role)
    // ordersTable.grantReadWriteData(lambdaRole)

  }
}
