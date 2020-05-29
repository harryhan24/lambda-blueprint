import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isRight } from "fp-ts/lib/Either";
import { CrudRepository } from "@serverless-blueprint/core";
import { CreateDto } from "./dtos/create-dto";
import { Customer } from "./entities/customer";
import { Service } from "./service";

const tableName  = process.env.TABLE_NAME!; // Todo
const repository = new CrudRepository<Customer>({ tableName: tableName });
const service    = new Service(repository);

export async function entrypoint(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.debug("Received customer-event: %s", event);

  const body = event.body;
  if (body == null) { return { statusCode: 400, body: "" }; }

  try {
    const createDto = JSON.parse(body);
    const either = CreateDto.decode(createDto); // ---> Unknown props will be stripped.
    if (isRight(either)) {
      const customerDto = await service.createCustomer(either.right);
      return {
        statusCode: 200,
        body:       JSON.stringify(customerDto),
      };
    } else {
      return {
        statusCode: 400,
        body:       "", // Todo:  Send reasons To our Consumers here?
      };
    }
  } catch (reason) {
    console.debug(reason);
    return { statusCode: 500, body: "" };
    // Todo
  }
}
