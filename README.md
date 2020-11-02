# AWS Sample Deploying Container Application to AWS using AWS for GitHub Actions


## Running Locally

To run locally
```bash
docker build -t webserver
docker run -it --rm -d -p 8080:80 --name web webserver
```

## Deploying

To create resources, execute.

```
cdk deploy
```

Store the outputs of the CloudFormation to the GitHub Secrets.

![README-1](/docs/images/README-1.png)
![README-2](/docs/images/README-2.png)
