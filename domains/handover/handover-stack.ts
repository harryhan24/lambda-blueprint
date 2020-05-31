import * as apigateway from "@aws-cdk/aws-apigateway";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import { DomainStackProps } from "../../cdk/interfaces/domain-stack-props";

export class HandoverStack extends cdk.Stack {
  constructor(scope: cdk.App, props: DomainStackProps) {
    super(scope, `${props.nodeEnv}-handover-stack`, props);

    const restApi = props.restApi;

    const env = {
      NODE_ENV: props.nodeEnv,
      // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    };

    const dynamoTable = new dynamodb.Table(this, "handovers", {
      tableName: `${props.nodeEnv}-handovers`,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const createLambda = new lambda.Function(this, "createLambda", {
      code:    lambda.AssetCode.fromAsset("domains/handover/dist", { exclude: ["**", "!create-lambda-bundle.js"] }),
      handler: "create-lambda-bundle.entrypoint",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        ...env,
      }
    });

    const deleteLambda = new lambda.Function(this, "deleteLambda", {
      code:    lambda.AssetCode.fromAsset("domains/handover/dist", { exclude: ["**", "!delete-lambda-bundle.js"] }),
      handler: "delete-lambda-bundle.entrypoint",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        ...env,
      }
    });

    const getLambda = new lambda.Function(this, "getLambda", {
      code:    lambda.AssetCode.fromAsset("domains/handover/dist", { exclude: ["**", "!get-lambda-bundle.js"] }),
      handler: "get-lambda-bundle.entrypoint",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        ...env,
      }
    });

    const updateLambda = new lambda.Function(this, "updateLambda", {
      code:    lambda.AssetCode.fromAsset("domains/handover/dist", { exclude: ["**", "!update-lambda-bundle.js"] }),
      handler: "update-lambda-bundle.entrypoint",
      runtime: lambda.Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: dynamoTable.tableName,
        ...env,
      }
    });

    dynamoTable.grantWriteData(createLambda);
    dynamoTable.grantWriteData(deleteLambda);
    dynamoTable.grantReadData(getLambda);
    dynamoTable.grantWriteData(updateLambda);

    const handovers = restApi.root.addResource("handovers");

    const createIntegration = new apigateway.LambdaIntegration(createLambda);
    handovers.addMethod("POST", createIntegration);

    const handover = handovers.addResource("{id}");

    const deleteIntegration = new apigateway.LambdaIntegration(deleteLambda);
    handover.addMethod("DELETE", deleteIntegration);

    const getIntegration = new apigateway.LambdaIntegration(getLambda);
    handover.addMethod("GET", getIntegration);

    const updateIntegration = new apigateway.LambdaIntegration(updateLambda);
    handover.addMethod("PUT", updateIntegration);

    handovers.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS, // <--- Todo: Restrict?
      allowMethods: ["POST"],
    });
    handover.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS, // <--- Todo: Restrict?
      allowMethods: ["DELETE, GET, PUT"],
    });
  }
}
