import {
    Stack,
    StackProps,
    aws_s3 as S3,
    aws_s3_deployment as S3Deployment,
    aws_cloudfront as CloudFront,
    aws_cloudfront_origins as CloudFrontOrigins,
    aws_route53 as Route53,
    aws_certificatemanager as ACM,
    aws_iam as IAM,
    CfnOutput,
    RemovalPolicy,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'


// define properties for webapp stack
export interface WebappProps extends StackProps {

    /** @param {string} assetsPath where the website is located */
    assetsPath: string
    domainName?: string
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
        })
        // exportName: 'webappBucketName'


        // [ ] 1.3.1: create Route 53 record set [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-route53-readme.html)
        // const domainName = props?.domainName || `${Date.now()}.diegotrs.com`

        // const hostedZone = new Route53.HostedZone(this, 'hoztedZone', { zoneName: domainName })

        // const cert = new ACM.DnsValidatedCertificate(this, 'webapp-cert', { 
        //     domainName: domainName, 
        //     hostedZone, 

        // })
        // const record


        // [ ] 1.2.1: create CloudFront distribution [docs](https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cloudfront-readme.html)
        const originAccessIdentity = new CloudFront.OriginAccessIdentity(this, 'OriginAccessIdentity')

        // allow clowdfront to read s3 webpp files
        webappBucket.grantRead(originAccessIdentity)

        const cdnDistribution = new CloudFront.Distribution(this, 'WebappDistribution', {
            defaultRootObject: 'index.html',

            defaultBehavior: {
                origin: new CloudFrontOrigins.S3Origin(webappBucket, { originAccessIdentity })
            },

            // certificate: cert,
            // domainNames: [domainName]
        })

        new CfnOutput(this, 'webappDnsUrl', {
            value: cdnDistribution.distributionDomainName,
        })
        // exportName: 'webappDnsUrl'

        new CfnOutput(this, 'distributionId', {
            value: cdnDistribution.distributionId,
        })
        // exportName: 'distributionId'



    }
}
