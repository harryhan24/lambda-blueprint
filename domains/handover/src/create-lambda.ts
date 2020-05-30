import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isRight } from "fp-ts/lib/Either";
import { CrudRepository, decrypt, handleError } from "@serverless-blueprint/core";
import { CreateDto } from "./dtos/create-dto";
import { Handover } from "./entities/handover";
import { Service } from "./service";
import { Keys } from "./keys";

// @ts-ignore
process.env = decrypt(process.env); // Todo?

const tableName  = process.env[Keys.TABLE_NAME] || "";
const repository = new CrudRepository<Handover>({ tableName: tableName });

// Initialize service outside of entrypoint to keep http-connection alive.
const service = new Service(repository);

export async function entrypoint(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  console.debug("Received handover-event: %s", event);

  const body = event.body;
  if (body == null) { return { statusCode: 400, body: "" }; }

  try {
    const createDto = JSON.parse(body);
    const either = CreateDto.decode(createDto); // ---> Unknown props will be stripped.
    if (isRight(either)) {
      const handoverDto = await service.createHandover(either.right);
      return { statusCode: 201, body: JSON.stringify(handoverDto) };
    } else {
      return { statusCode: 400, body: "" };
    }
  } catch (error) {
    return handleError(error);
    // Todo
  }
}
