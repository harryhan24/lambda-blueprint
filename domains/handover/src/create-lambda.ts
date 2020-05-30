import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { isRight } from "fp-ts/lib/Either";
import { CrudRepository, handleError } from "@serverless-blueprint/core";
import { CreateDto } from "./dtos/create-dto";
import { Handover } from "./entities/handover";
import { Service } from "./service";

const tableName  = process.env.TABLE_NAME || ""; // Todo
const repository = new CrudRepository<Handover>({ tableName: tableName });
/**
 * Initialize outside of handler to keep connections alive.
 * @see https://docs.atlas.mongodb.com/best-practices-connecting-to-aws-lambda/
 */
const service = new Service(repository);

export async function entrypoint(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  context.callbackWaitsForEmptyEventLoop = false;

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
