import * as cdk from "@aws-cdk/core";
import { Vpc } from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as sm from "@aws-cdk/aws-secretsmanager";

export class FargateDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const secret = sm.Secret.fromSecretAttributes(this, "ImportedSecret", {
        secretCompleteArn:
          "arn:aws:secretsmanager:af-south-1:062074170126:secret:TestEnvSecret-dhc6bK"
        // If the secret is encrypted using a KMS-hosted CMK, either import or reference that key:
        // encryptionKey: ...
    });

    // VPC
    const vpc = new Vpc(this, "serverVPC", {
      maxAzs: 2,
      natGateways: 1,
    });

    // Fargate cluster
    const cluster = new ecs.Cluster(this, "serverCluster", {
      vpc: vpc as any,
    });

    // const getOldCluster = ecs.Cluster.fromClusterAttributes(this, "serverCluster", {
    //     clusterName: "",
    //     securityGroups: [],
    //     vpc: vpc as any,
    // })

    // Fargate service
    console.log('secret', secret.secretValue.unsafeUnwrap())
    const serverService = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "serverService", {
      cluster: cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("./server/"),
        environment: {
          TEST_ENV_VARIABLE: secret.secretValue.unsafeUnwrap(),
        },
      },
    });

    // Health check
    serverService.targetGroup.configureHealthCheck({ path: "/health" });

    // Load balancer url
    new cdk.CfnOutput(this, "loadBalancerUrl", {
      value: serverService.loadBalancer.loadBalancerDnsName,
      exportName: "loadBalancerUrl",
    });
  }
}