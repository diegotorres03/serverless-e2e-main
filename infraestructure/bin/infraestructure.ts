#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { WebAppStack } from '../lib/webapp-stack'
import { RestApiStack } from '../lib/api-stack'
import { BackendStack } from '../lib/backend-stack'
import { IConstruct } from 'constructs'
const app = new cdk.App()


// creating WebAppStack
const apidoc = new WebAppStack(app, 'apidoc', {
  env: { region: process.env.AWS_REGION },
  assetsPath: '../apidoc'
})

// creating WebAppStack
const webapp = new WebAppStack(app, 'webapp', {
  env: { region: process.env.AWS_REGION },
  assetsPath: '../webapp'
})

// creating RestApiStack
const api = new RestApiStack(app, 'api', {
  env: {
    region: process.env.AWS_REGION,
  }
})


// creating BackendStack
const backend = new BackendStack(app, 'backend', {
  env: {
    region: process.env.AWS_REGION,
  }
})


// const boundary = (stackParam: IConstruct) => new cdk.aws_iam.ManagedPolicy(stackParam, 'permissions-boundary-ECS', {
//   statements: [
//     new cdk.aws_iam.PolicyStatement({
//       effect: cdk.aws_iam.Effect.DENY,
//       actions: ['ECS:*'],
//       resources: ['*'],
//     }),
//   ],
// })

// cdk.aws_iam.PermissionsBoundary
//   .of(backend)
//   .apply(boundary(backend))


// cdk.aws_iam.PermissionsBoundary
//   .of(api)
//   .apply(boundary(api))


// cdk.aws_iam.PermissionsBoundary
//   .of(webapp)
//   .apply(boundary(webapp))

// api depends on backend