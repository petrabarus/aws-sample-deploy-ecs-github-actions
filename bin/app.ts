#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecsPatterns from '@aws-cdk/aws-ecs-patterns';
import * as ecr from '@aws-cdk/aws-ecr';
import { CfnOutput } from '@aws-cdk/core';

class AppStack extends cdk.Stack {
  private user: iam.User;
  private key: iam.CfnAccessKey;
  private repo: ecr.Repository;
  private cluster: ecs.ICluster;
  private service: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.createIamUser();
    this.createEcrRepo();
    this.createEcsCluster();
    this.createEcsService();
    this.printOutput();
  }

  createIamUser() {
    this.user = new iam.User(this, 'User');
    this.key = new iam.CfnAccessKey(this, 'AccessKey', {
      userName: this.user.userName,
    });
  }
  
  createEcrRepo() {
    this.repo = new ecr.Repository(this, 'Repository');
    this.user.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      effect: iam.Effect.ALLOW,
      actions: [
        'ecr:GetAuthorizationToken'
      ]
    }));
    this.repo.grantPullPush(this.user);
  }
  
  createEcsCluster() {
    this.cluster = new ecs.Cluster(this, 'Cluster');
  }

  createEcsService() {
    this.service = new ecsPatterns.
    ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster: this.cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
        containerName: 'web',
      },
    });
  }

  printOutput() {
    new cdk.CfnOutput(this, 'AccessKeyId', { value: this.key.ref });
    new cdk.CfnOutput(this, 'AccessKeySecret', { value: this.key.attrSecretAccessKey });
    new cdk.CfnOutput(this, 'RepositoryName', { value: this.repo.repositoryName });
    new cdk.CfnOutput(this, 'RepositoryUri', { value: this.repo.repositoryUri });
    new cdk.CfnOutput(this, 'ClusterArn', { value: this.cluster.clusterArn });
    new cdk.CfnOutput(this, 'ClusterName', { value: this.cluster.clusterName });
  }
}

const app = new cdk.App();
new AppStack(app, 'ECSDeployGitHubActionApp');
