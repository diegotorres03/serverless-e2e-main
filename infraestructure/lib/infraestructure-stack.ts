import {
  Stack, StackProps,
  aws_s3 as S3,
  aws_s3_deployment as S3Deployment,
  aws_cloudfront as CloudFront,
} from 'aws-cdk-lib'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BucketAccessControl } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'

export class InfraestructureStack extends Stack {
}


export class WebAppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // [ ] TODO: create S3 Bucket as web hosting to store webapp [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-s3-readme.html)
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


    // [ ] TODO: create CloudFront distribution [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html)

    const originAccessIdentity = new CloudFront.OriginAccessIdentity(this, 'OriginAccessIdentity')

    // allow clowdfront to read s3 webpp files
    webappBucket.grantRead(originAccessIdentity)

    const cdnDistribution = new CloudFront.Distribution(this, 'WebappDistribution', {
      defaultRootObject: 'index.html',

      defaultBehavior: {
        origin: new S3Origin(webappBucket, { originAccessIdentity })
      }
    })

    // [ ] TODO: create Route 53 record set [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-route53-readme.html)
  }
}



// [Host a static website on S3 using AWS CDK](https://medium.com/swlh/host-a-static-website-on-s3-using-aws-cdk-b9151213aad4)
// [Deploying a static website using S3 and CloudFront](https://aws-cdk.com/deploying-a-static-website-using-s3-and-cloudfront/)
// [CORS configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ManageCorsUsing.html)

/*
<CORSConfiguration>
 <CORSRule>
   <AllowedOrigin>*</AllowedOrigin>
   <AllowedMethod>PUT</AllowedMethod>
   <AllowedMethod>POST</AllowedMethod>
   <AllowedMethod>DELETE</AllowedMethod>
   <AllowedHeader>*</AllowedHeader>
  <MaxAgeSeconds>3000</MaxAgeSeconds>
  <ExposeHeader>x-amz-server-side-encryption</ExposeHeader>
  <ExposeHeader>x-amz-request-id</ExposeHeader>
  <ExposeHeader>x-amz-id-2</ExposeHeader>
 </CORSRule>
</CORSConfiguration>
[
    {
        "AllowedHeaders": [ "*" ],
        "AllowedMethods": [ "PUT", "POST", "DELETE" ],
        "AllowedOrigins": [ "http://www.example1.com" ],
        "ExposeHeaders": []
    },
    {
        "AllowedHeaders": [ "*" ],
        "AllowedMethods": [ "PUT", "POST", "DELETE" ],
        "AllowedOrigins": [ "http://www.example2.com" ],
        "ExposeHeaders": []
    },
    {
        "AllowedHeaders": [],
        "AllowedMethods": [ "GET" ],
        "AllowedOrigins": [ "*" ],
        "ExposeHeaders": []
    }
]
*/