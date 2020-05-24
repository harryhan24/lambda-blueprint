import { CrudRepository, Error404 } from "@serverless-blueprint/core";
import { pipe } from "fp-ts/lib/pipeable"
import { fold } from "fp-ts/lib/Either"
import { v4 as uuidv4 } from "uuid";
import { CreateDto } from "./dtos/create-dto";
import { GetDto } from "./dtos/get-dto";
import { UpdateDto } from "./dtos/update-dto";
import { Customer } from "./entities/customer";

export class Service {
  constructor(
    private crudRepository: CrudRepository<Customer>
  ) {}

  async createCustomer(createDto: CreateDto): Promise<void> {
    const date = new Date();

    const customer: Customer = {
      id: uuidv4(),
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      ...createDto,
    };
    return pipe(
      Customer.decode(customer),
      fold(
        // failure handler
        (reason) => Promise.reject(reason),
        // success handler
        (result) => this.crudRepository.put(result),
      ),
    );
    // Todo ...
  }

  async deleteCustomer(id: string): Promise<void> {
    const keys: Partial<Customer> = { id: id };
    return this.crudRepository.delete(keys);
  }

  async getCustomer(id: string): Promise<GetDto> {
    const keys: Partial<Customer> = { id: id };
    const customer = await this.crudRepository.get(keys).catch((reason: any) => Promise.reject(reason));
    if (!customer) { throw new Error404(); }
    const { createdAt, updatedAt, ...getDto } = customer;
    return getDto;
  }

  async updateCustomer(id: string, updateDto: UpdateDto): Promise<void> {}
}
