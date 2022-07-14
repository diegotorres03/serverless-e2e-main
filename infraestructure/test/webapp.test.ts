import * as cdk from 'aws-cdk-lib'
import { Capture, Match, Template } from 'aws-cdk-lib/assertions'
import { WebAppStack } from '../lib/webapp-stack'


function getTemplate() {
    const app = new cdk.App()
    const webappStack = new WebAppStack(app, 'MyTestStack')
    return Template.fromStack(webappStack)
}

describe("webapp stack", () => {

    test('all required resources are present', () => {
        const template = getTemplate()
        const app = new cdk.App()
        const webappStack = new WebAppStack(app, 'MyTestStack')
        const template = Template.fromStack(webappStack)
        
        template.resourceCountIs('AWS::S3::Bucket', 1)
        template.resourceCountIs('AWS::S3::BucketPolicy', 1)
        template.resourceCountIs('AWS::CloudFront::Distribution', 1)
        template.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1)

    })



    test('webapp bucket is private', () => {
        const template = getTemplate()

        template.hasResourceProperties('AWS::S3::Bucket', {
            AccessControl: 'Private',
        })
    })


    
    test('webapp bucket has cors configured', () => {
        const template = getTemplate()

        template.hasResourceProperties('AWS::S3::Bucket', {
            CorsConfiguration: {
                CorsRules: [{
                    AllowedHeaders: ["Authorization"],
                    AllowedMethods: ["GET"],
                    AllowedOrigins: ["*"],
                    ExposedHeaders: []
                }]
            }
        })
    })

})