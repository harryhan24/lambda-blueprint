import * as cdk from "@aws-cdk/core";
import { SharedStackProps } from "./interfaces/shared-stack-props";
import { DomainStackProps } from "./interfaces/domain-stack-props";
import { ApigatewayStack } from "./apigateway-stack";
import { CustomerStack } from "../domains/customer/customer-stack";
import { HandoverStack } from "../domains/handover/handover-stack";

const app = new cdk.App({});

const env = app.node.tryGetContext("ENV");
if (!env) { throw new Error("You missed a value for 'ENV'"); }

const sharedProps: SharedStackProps = { env: env };

const apigatewayStack = new ApigatewayStack(app, sharedProps);

const domainProps: DomainStackProps = { ...sharedProps, restApi: apigatewayStack.restApi };

new CustomerStack(app, domainProps);
new HandoverStack(app, domainProps);
