from aws_cdk import (
    # Duration,
    CfnOutput,
    Duration,
    Environment,
    Stack,
    aws_dynamodb as dynamo,
    aws_timestream as timestream,
    aws_lambda as lambda_,
    aws_lambda_event_sources as lambda_event_sources,
    aws_sqs as sqs,
    aws_sns as sns,
    RemovalPolicy
)
from constructs import Construct

class BackendStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        time_to_live_attribute = '_expireOn'

        # [ ] 3.1.1: create DynamoDB orders table [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_dynamodb/Table.html)
        orders_table = dynamo.Table(self, 'orders',
            partition_key=dynamo.Attribute(name='customer', type=dynamo.AttributeType.STRING),
            sort_key=dynamo.Attribute(name='id', type=dynamo.AttributeType.STRING),
            billing_mode=dynamo.BillingMode.PAY_PER_REQUEST,
            stream=dynamo.StreamViewType.NEW_AND_OLD_IMAGES,
            time_to_live_attribute=time_to_live_attribute,
            removal_policy=RemovalPolicy.DESTROY
        )

        # [ ] 3.1.2: connect api to dynamodb
        CfnOutput(self, 'ordersTableName-py', 
            export_name='ordersTableName-py', 
            value= orders_table.table_name
        )

        CfnOutput(self, 'ordersTableArn-py', 
            export_name='ordersTableArn-py', 
            value= orders_table.table_arn
        )

        # # [ ] 4.1.1: create processing orders queue [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_sqs/Queue.html)
        # orders_queue = sqs.Queue(self, 'ordersQueue', 
        #     visibility_timeout=Duration.seconds(60)
        # )

        # # [ ] 4.1.2: create user notification topic (sns) [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_sns/Topic.html)
        # user_notification_topic = sns.Topic(self, 'userNotification')

        # # [ ] 4.2.1: create a lambda to handle dynamodb stream [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html)
        # dynamo_lambda = lambda_.Function(self, 'dynamoHandler',
        #     runtime=lambda_.Runtime.NODEJS_16_X,
        #     code=lambda_.Code.from_asset('../functions/dynamo-handler'),
        #     handler='index.handler',
        #     environment=[
        #         ['QUEUE', orders_queue.queue_url],
        #         ['TS_DB', ''],
        #         ['TS_TABLE', '']
        #     ]
        # )

        # # [ ] 4.2.2: create a lambda to handle sqs messages [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html)
        # sqs_lambda = lambda_.Function(self, 'sqsHandler',
        #     runtime=lambda_.Runtime.NODEJS_16_X,
        #     code=lambda_.Code.from_asset('../functions/sqs-handler'),
        #     handler='index.handler',
        #     environment=[['QUEUE', orders_queue.queue_url]]
        # )


        # # [ ] 4.3.1: set lambda 4.2.1 as handler for dynamodb table updates [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html)

        # # allow lambda to read dynamo streams
        # orders_table.grant_stream_read(dynamo_lambda)

        # # add orders_table as source for lambda
        # dynamo_lambda.add_event_source(lambda_event_sources.DynamoEventSource(orders_table,
        #     starting_position=lambda_.StartingPosition.TRIM_HORIZON,
        #     batch_size=10
        # ))

        # # [ ] 4.3.2: set lambda 4.2.2 as handler for sqs queue messages [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-lambda-event-sources-readme.html)
        
        # # allow lambda to publish messages on queue
        # orders_queue.grant_send_messages(sqs_lambda)

        # # add orders_queue as source for lambda
        # sqs_lambda.add_event_source(lambda_event_sources.SqsEventSource(orders_queue, batch_size= 2))


