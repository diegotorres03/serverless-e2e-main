from aws_cdk import (
    # Duration,
    CfnOutput,
    Environment,
    Stack,
    aws_lambda as lambda_,
    aws_apigateway as apigateway,
    RemovalPolicy,
)
from constructs import Construct

class ApiStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # [ ] 2.1.2: create lambdas for createOrder [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html)
        get_orders_lambda = lambda_.Function(self, 'getOrders',
            runtime=lambda_.Runtime.NODEJS_16_X,
            handler='index.handler',
            code=lambda_.Code.from_asset('../functions/get-orders')
            # environment=[[ORDERS_TABLE=orders_table.table_name]]
        )

        # [ ] 2.1.2: create lambdas for createOrder [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html)
        create_orders_lambda = lambda_.Function(self, 'createOrder',
            runtime=lambda_.Runtime.NODEJS_16_X,
            handler='index.handler',
            code=lambda_.Code.from_asset('../functions/create-order')
            # environment=[[ORDERS_TABLE=orders_table.table_name]]
        )

        # [ ] 2.1.2: create lambdas for createOrder [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_lambda/Function.html)
        update_orders_lambda = lambda_.Function(self, 'updateOrder',
            runtime=lambda_.Runtime.NODEJS_16_X,
            handler='index.handler',
            code=lambda_.Code.from_asset('../functions/update-orders')
            # environment=[[ORDERS_TABLE=orders_table.table_name]]
        )

        # [ ] 2.2.1: create api [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_apigateway/RestApi.html)
        api = apigateway.RestApi(self, 'ordersApi',
            description='',
            deploy_options=apigateway.StageOptions(stage_name='dev'),
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_headers=[
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                ],
                allow_origins=['*'],
                allow_methods=['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                allow_credentials=True
            )
        )

        # export api value so it can be called by other stacks
        CfnOutput(self, 'apiUrl', 
            export_name='apiUrl', 
            value= api.url
        )

        # [ ] 2.2.2: create /orders resource [POST, GET] [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_apigateway/IResource.html)
        orders_endpoint = api.root.add_resource('orders')
        orders_endpoint.add_method('GET', apigateway.LambdaIntegration(get_orders_lambda, proxy=True))
        orders_endpoint.add_method('POST', apigateway.LambdaIntegration(create_orders_lambda, proxy=True))

        # [ ] 2.2.3: create /orders/{customer}/{id} [docs](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk.aws_apigateway/IResource.html)
        single_order_endpoint = orders_endpoint.add_resource('{customer}').add_resource('{id}')
        single_order_endpoint.add_method('PATCH', apigateway.LambdaIntegration(update_orders_lambda, proxy=True))