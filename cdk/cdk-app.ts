import * as cdk from "@aws-cdk/core";
import { CustomerStack } from "../domains/customer/customer-stack";
import { HandoverStack } from "../domains/handover/handover-stack";
import { ApigatewayStack } from "./apigateway-stack";
import { SharedStackProps } from "./interfaces/shared-stack-props";
import { DomainStackProps } from "./interfaces/domain-stack-props";

const app = new cdk.App({});

const stage = app.node.tryGetContext("STAGE");

const sharedProps: SharedStackProps = { stage: stage };

const apigatewayStack = new ApigatewayStack(app, sharedProps);

const domainProps: DomainStackProps = { ...sharedProps, restApi: apigatewayStack.restApi };

new CustomerStack(app, domainProps);
new HandoverStack(app, domainProps);
