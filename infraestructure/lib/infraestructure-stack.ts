import { 
  Stack, 
  StackProps,
  aws_s3 as S3,
  aws_s3_deployment as S3Deployment,
  aws_cloudfront as CloudFront,
  aws_cloudfront_origins as CloudFrontOrigins,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'


export class InfraestructureStack extends Stack {
}


export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)
    // [x] TODO: create S3 Bucket as web hosting to store webapp [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-s3-readme.html)
    const webappBucket = new S3.Bucket(this, 'webapp-artifact', {
      accessControl: S3.BucketAccessControl.PRIVATE,
      cors: [{
        allowedMethods: [ S3.HttpMethods.GET ],
        allowedOrigins: [ '*' ],

        // the properties below are optional
        allowedHeaders: ['Authorization'],
        exposedHeaders: [],
      }],
    })

    const webappDeployment = new S3Deployment.BucketDeployment(this, 'deployStaticWebapp', {
      sources: [ S3Deployment.Source.asset('../webapp') ],
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
    
  
    // [ ] TODO: create Route 53 record set [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-route53-readme.html)
  }
}
