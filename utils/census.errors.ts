export class CensusError extends Error {
  name = CensusError.name;
}

export class InvalidCensusResponse extends CensusError {
  name = InvalidCensusResponse.name;

  static readonly EMPTY_RESPONSE = () => new InvalidCensusResponse('Data was empty');
  static readonly INCORRECT_RESPONSE = (data: unknown) => new InvalidCensusResponse(`Data was incorrect: ${JSON.stringify(data)}`);
  static readonly NOT_OBJECT = (data: unknown) => new InvalidCensusResponse(`Data is not an object: ${JSON.stringify(data)}`);
  static readonly NO_LIST = (data: object) => new InvalidCensusResponse(`Data does not contain list: ${JSON.stringify(data)}`);
  static readonly NO_RETURN = (data: object) => new InvalidCensusResponse(`Data does not contain return: ${JSON.stringify(data)}`);
}

export class CensusServerError extends CensusError {
  name = InvalidCensusResponse.name;

  constructor(message: string, readonly code?: string) {
    super(message);
  }
}
