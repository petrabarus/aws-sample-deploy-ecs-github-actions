#!/usr/bin/env node
import 'source-map-support/register';
import { App, CfnOutput, Construct, Stack, StackProps } from '@aws-cdk/core';
import { CfnAccessKey, Effect, PolicyStatement, User } from '@aws-cdk/aws-iam';
import { Repository } from '@aws-cdk/aws-ecr';
import { Cluster, ContainerImage, ICluster } from '@aws-cdk/aws-ecs';
import { ApplicationLoadBalancedFargateService } from '@aws-cdk/aws-ecs-patterns';

class AppStack extends Stack {
  private user: User;
  private key: CfnAccessKey;
  private repo: Repository;
  private cluster: ICluster;
  private service: ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.createIamUser();
    this.createEcrRepo();
    this.createEcsCluster();
    this.createEcsService();
    this.printOutput();
  }

  createIamUser() {
    this.user = new User(this, 'User');
    this.key = new CfnAccessKey(this, 'AccessKey', {
      userName: this.user.userName,
    });
  }
  
  createEcrRepo() {
    this.repo = new Repository(this, 'Repository');
    this.user.addToPolicy(new PolicyStatement({
      resources: ['*'],
      effect: Effect.ALLOW,
      actions: [
        'ecr:GetAuthorizationToken',
      ]
    }));
    this.repo.grantPullPush(this.user);
  }
  
  createEcsCluster() {
    this.cluster = new Cluster(this, 'Cluster');
  }

  createEcsService() {
    this.service = new ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster: this.cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      taskImageOptions: {
        image: ContainerImage.fromRegistry("nginx:latest"),
        containerName: 'web',
      },
    });
    this.user.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ecs:ListTaskDefinitions',
      ],
      resources: ['*'],
    }));
  }

  printOutput() {
    new CfnOutput(this, 'AccessKeyId', { value: this.key.ref });
    new CfnOutput(this, 'AccessKeySecret', { value: this.key.attrSecretAccessKey });
    new CfnOutput(this, 'RepositoryName', { value: this.repo.repositoryName });
    new CfnOutput(this, 'RepositoryUri', { value: this.repo.repositoryUri });
    new CfnOutput(this, 'ClusterArn', { value: this.cluster.clusterArn });
    new CfnOutput(this, 'ClusterName', { value: this.cluster.clusterName });
    new CfnOutput(this, 'TaskDefinitionFamily', { value: this.service.taskDefinition.family });
  }
}

const app = new App();
new AppStack(app, 'ECSDeployGitHubActionApp');
