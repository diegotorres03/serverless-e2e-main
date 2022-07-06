import {
    Stack,
    StackProps,
    aws_cognito as Cognito,
    CfnOutput,
    Fn,
    Duration,
    RemovalPolicy,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'



export class AuthStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        const userpool = new Cognito.UserPool(this, 'app-user-pool', {

        })


        const client = userpool.addClient('auth-hosted-ui', {
            oAuth: {
                flows: { implicitCodeGrant: true },
                callbackUrls: [
                    'https://mywebapp.com'
                ],
            },
        })


    }
}