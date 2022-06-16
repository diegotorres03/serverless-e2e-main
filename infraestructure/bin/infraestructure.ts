#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { 
  WebAppStack,
} from '../lib/infraestructure-stack'

const app = new cdk.App()


// creating WebAppStack
new WebAppStack(app, 'webappStack', {
  env: {
    region: process.env.AWS_REGION,
  }
})
