import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handleError } from "@serverless-blueprint/core";
import { initialize } from "./initializer";
import { Service } from "./service";

let service: Service;

export async function entrypoint(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  console.debug("Received customer-event: %s", event);
  try {
    if (!service) {
      service = await initialize();
    }
    const pathParameters = event.pathParameters;
    if (pathParameters == null) { return { statusCode: 400, body: "" }; }

    const customerDto = await service.getCustomer(pathParameters["id"]);
    return { statusCode: 200, body: JSON.stringify(customerDto) };
  } catch (error) {
    return handleError(error);
    // Todo
  }
}
