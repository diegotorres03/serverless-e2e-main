#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { 
  WebAppStack,
  RestApiStack,
  BackendStack,
} from '../lib/infraestructure-stack'

const app = new cdk.App()


// creating WebAppStack
const webapp = new WebAppStack(app, 'webappStack', {
  env: {
    region: process.env.AWS_REGION,
  }
})


const restApi = new RestApiStack(app, 'restApiStack', {
  env: {
    region: process.env.AWS_REGION,
  }
})


// creating BackendStack
const backend = new BackendStack(app, 'backendStack', {
  env: {
    region: process.env.AWS_REGION,
  }
})
