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
  aws_timestream as TimeStream,
  // aws_apigatewayv2 as ApiGateway2,
  aws_sqs as SQS,
  aws_sns as SNS,
  CfnOutput,
  Fn,
  Duration,
  RemovalPolicy,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'

import * as apiConfig from '../../api/claudia.json'

export class InfraestructureStack extends Stack {
}

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const timeToLiveAttribute = '_expireOn'

    // [ ] 3.1.1: create DynamoDB orders table [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-dynamodb-readme.html)
    // const ordersTableArn = Fn.importValue('ordersTableArn')
    // const ordersTable = DynamoDB.Table.fromTableArn(this, 'ordersTable', ordersTableArn)
    // console.log('ordersTableArn', ordersTableArn.toString())
    // console.log('ordersTable.tableStreamArn?.toString()', ordersTable.tableStreamArn?.toString())
    const ordersTable = new DynamoDB.Table(this, 'orders', {
      partitionKey: { name: 'customer', type: DynamoDB.AttributeType.STRING },
      sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
      billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
      stream: DynamoDB.StreamViewType.NEW_AND_OLD_IMAGES,
      timeToLiveAttribute,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // [ ] 3.1.2: connect api to dynamodb
    new CfnOutput(this, 'ordersTableName', {
      value: ordersTable.tableName,
      exportName: 'ordersTableName'
    })
    new CfnOutput(this, 'ordersTableArn', {
      value: ordersTable.tableArn,
      exportName: 'ordersTableArn'
    })


    // [ ] 4.1.1: create processing orders queue [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-sqs.Queue.html)
    const ordersQueue = new SQS.Queue(this, 'ordersQueue', {
      visibilityTimeout: Duration.seconds(60)
    })

    // [ ] 4.1.2: create user notification topic (sns) [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-sns.Topic.html)
    const userNotificationTopic = new SNS.Topic(this, 'userNotification')

    // [ ] 4.2.1: create a lambda to handle dynamodb stream [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
    const dynamoLambda = new Lambda.Function(this, 'dynamoHandler', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      code: Lambda.Code.fromAsset('../functions/dynamo-handler'),
      handler: 'index.handler',
      environment: {
        QUEUE: ordersQueue.queueUrl,
        TS_DB: '',
        TS_TABLE: '',
      },
    })

    // [ ] 4.2.2: create a lambda to handle sqs messages [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
    const sqsLambda = new Lambda.Function(this, 'sqsHandler', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      code: Lambda.Code.fromAsset('../functions/sqs-handler'),
      handler: 'index.handler',
      environment: { QUEUE: ordersQueue.queueUrl },
    })




    // [ ] 4.3.1: set lambda 4.2.1 as handler for dynamodb table updates [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html#addwbreventwbrsourcesource)

    // allow lambda to read dynamo stream 
    ordersTable.grantStreamRead(dynamoLambda)

    // add ordersTable as source for lambda
    dynamoLambda.addEventSource(new LambdaEventSources.DynamoEventSource(ordersTable, {
      startingPosition: Lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 10,
    }))

    // [ ] 4.3.2: set lambda 4.2.2 as handler for sqs queue messages [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-lambda-event-sources-readme.html)
    // allow lambda to publish messages on queue
    ordersQueue.grantSendMessages(dynamoLambda)
    sqsLambda.addEventSource(new LambdaEventSources.SqsEventSource(ordersQueue, {
      batchSize: 2,
    }))



    /////////////////

    const TimeStreamDBName = 'serverless-e2e-db'
    const usersLogsTableName = 'ordersts'

    const TimestreamDB = new TimeStream.CfnDatabase(this, TimeStreamDBName, {
      databaseName: TimeStreamDBName,
    })

    const ordersTSTable = new TimeStream.CfnTable(this, usersLogsTableName, {
      tableName: usersLogsTableName,
      databaseName: TimeStreamDBName || TimestreamDB.databaseName || '',

      retentionProperties: {
        MemoryStoreRetentionPeriodInHours: '36',
        MagneticStoreRetentionPeriodInDays: `${100 * 364}`
      },
      tags: [{ key: 'project', value: 'hackaton-score-app' }],
    })

    ordersTSTable.addDependsOn(TimestreamDB)




    const timeStreamPolicyStatement = new IAM.PolicyStatement({
      actions: [
        // "timestream:DescribeEndpoints",
        // "timestream:UpdateTable",
        "timestream:DescribeDatabase",
        "timestream:DescribeTable",
        "timestream:ListMeasures",
        "timestream:Select",
        "timestream:WriteRecords",
      ],
      resources: [TimestreamDB.attrArn.toString(), ordersTSTable.attrArn.toString()],
    })
    const timeStreamEndpointsPolicyStatement = new IAM.PolicyStatement({
      actions: [
        "timestream:DescribeEndpoints",
      ],
      resources: ["*"],
      // resources: ["arn:aws:timestream:*"],
      // resources: [TimestreamDB.attrArn.toString(), ordersTSTable.attrArn.toString()],
    })

    dynamoLambda.role?.attachInlinePolicy(
      new IAM.Policy(this, 'use-timestream-policy', {
        statements: [
          timeStreamPolicyStatement,
          timeStreamEndpointsPolicyStatement,
        ],
      })
    )

  }
}

export class RestApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)


    // [import value](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_core.Fn.html#static-importwbrvaluesharedvaluetoimport)
    // [ ] 3.1.2: connect api to dynamodb [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-dynamodb.Table.html#static-fromwbrtablewbrarnscope-id-tablearn)
    const ordersTableArn = Fn.importValue('ordersTableArn')
    const ordersTable = DynamoDB.Table.fromTableArn(this, 'ordersTable', ordersTableArn)
    console.log('ordersTableArn', ordersTableArn.toString())
    console.log('ordersTable.tableStreamArn?.toString()', ordersTable.tableStreamArn?.toString())


    // this.ordersTable = new DynamoDB.Table(this, 'orders', {
    //   partitionKey: { name: 'customer', type: DynamoDB.AttributeType.STRING },
    //   sortKey: { name: 'id', type: DynamoDB.AttributeType.STRING },
    //   billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
    //   stream: DynamoDB.StreamViewType.NEW_AND_OLD_IMAGES,
    // })

    // new CfnOutput(this, 'ordersTableName', {
    //   value: this.ordersTable.tableName,
    //   exportName: 'ordersTableName'
    // })

    // new CfnOutput(this, 'ordersTableArn', {
    //   value: this.ordersTable.tableArn,
    //   exportName: 'ordersTableArn'
    // })



    // [ ] 2.1.1: create lambdas for getOrders [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
    const getOrdersLambda = new Lambda.Function(this, 'getOrders', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Lambda.Code.fromAsset('../functions/get-orders'),// [ ] check the deployment, is this needed here
      environment: { ORDERS_TABLE: ordersTable.tableName }
    })


    // [ ] 2.1.2: create lambdas for createOrder [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
    const createOrderLambda = new Lambda.Function(this, 'createOrder', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Lambda.Code.fromAsset('../functions/create-order'),
      environment: { ORDERS_TABLE: ordersTable.tableName }
    })


    // [ ] 2.1.3: create lambdas for updateOrder [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.Function.html)
    const updateOrderLambda = new Lambda.Function(this, 'updateOrder', {
      runtime: Lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Lambda.Code.fromAsset('../functions/update-order'),
      environment: { ORDERS_TABLE: ordersTable.tableName }
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
        ],
        allowOrigins: ['*'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
      }
    })

    // export api value so it can be called by other stacks
    new CfnOutput(this, 'apiUrl', {
      value: api.url,
      exportName: 'apiUrl'
    })

    // [ ] 2.2.2: create /orders resource [POST, GET] [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-apigateway.IResource.html#addwbrmethodhttpmethod-target-options)
    const ordersEndpoint = api.root.addResource('orders')
    ordersEndpoint.addMethod('GET', new ApiGateway.LambdaIntegration(getOrdersLambda, { proxy: true }))
    ordersEndpoint.addMethod('POST', new ApiGateway.LambdaIntegration(createOrderLambda, { proxy: true }))


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

  }
}

// define properties for webapp stack
export interface WebappProps extends StackProps {

  /** @param {string} assetsPath where the website is located */
  assetsPath: string
}

export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: WebappProps) {
    super(scope, id, props)
    // [ ] 1.1.1: create S3 Bucket as web hosting to store webapp [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-s3-readme.html)
    const webappBucket = new S3.Bucket(this, 'webapp-artifact', {
      accessControl: S3.BucketAccessControl.PRIVATE,
      cors: [{
        allowedMethods: [S3.HttpMethods.GET],
        allowedOrigins: ['*'],

        // the properties below are optional
        allowedHeaders: ['Authorization'],
        exposedHeaders: [],
      }],
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const webappDeployment = new S3Deployment.BucketDeployment(this, 'deployStaticWebapp', {
      sources: [S3Deployment.Source.asset(props?.assetsPath || '../webapp')],
      destinationBucket: webappBucket,
    })

    new CfnOutput(this, 'webappBucketName', {
      value: webappBucket.bucketName,
      exportName: 'webappBucketName'
    })


    // [ ] 1.2.1: create CloudFront distribution [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html)
    const originAccessIdentity = new CloudFront.OriginAccessIdentity(this, 'OriginAccessIdentity')

    // allow clowdfront to read s3 webpp files
    webappBucket.grantRead(originAccessIdentity)

    const cdnDistribution = new CloudFront.Distribution(this, 'WebappDistribution', {
      defaultRootObject: 'index.html',

      defaultBehavior: {
        origin: new CloudFrontOrigins.S3Origin(webappBucket, { originAccessIdentity })
      }
    })

    new CfnOutput(this, 'webappDnsUrl', {
      value: cdnDistribution.distributionDomainName,
      exportName: 'webappDnsUrl'
    })

    new CfnOutput(this, 'distributionId', {
      value: cdnDistribution.distributionId,
      exportName: 'distributionId'
    })


    // [o] 1.3.1: create Route 53 record set [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-route53-readme.html)

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
