#!/usr/bin/env node
import 'source-map-support/register';
// import * as cdk from 'aws-cdk-lib';
import * as cdk from "@aws-cdk/core";
import { FargateDemoStack } from '../lib/fargate';
import { CloudfrontDemoStack } from '../lib/cloudfront';

const app = new cdk.App();
new FargateDemoStack(app, 'FargateDemoStack', {
  env: { account: '062074170126', region: 'af-south-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new CloudfrontDemoStack(app, 'FargateDemoStack', {
  stage: "prod",
  env: { account: '062074170126', region: 'af-south-1' },
});