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


