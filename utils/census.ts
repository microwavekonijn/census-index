import {Config} from './config.js';
import {CensusParamType, CensusRecord} from './census.types.js';
import {CensusError, CensusServerError, InvalidCensusResponse} from './census.errors.js';

export namespace CensusAPI {
  const BASE_URL = 'https://census.daybreakgames.com';
  const NAMESPACE = 'ps2';

  export function censusFetch(method: 'get'): Promise<{
    name: string,
    count: number | '?' | 'dynamic',
    hidden: false | 'false',
    resolve_list: string[]
  }[]>;
  export function censusFetch(method: 'get',
                              collection: string,
                              params?: string): Promise<CensusRecord[]>;
  export function censusFetch(method: 'count',
                              collection: string,
                              params?: string): Promise<number>;
  export async function censusFetch(
    method: 'count' | 'get',
    collection?: string,
    params?: string,
  ): Promise<any> {
    // Build url
    let url = `${BASE_URL}/s:${Config.census.serviceId}/${method}/${NAMESPACE}`;

    if (collection) {
      url += `/${collection}`;

      if (params) url += `?` + params;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!data) throw InvalidCensusResponse.EMPTY_RESPONSE();
    if (typeof data != 'object') throw InvalidCensusResponse.NOT_OBJECT(data);

    if ('error' in data) {
      const {error} = data;
      if (typeof error != 'string') throw InvalidCensusResponse.INCORRECT_RESPONSE(data);

      throw new CensusError(error);
    }

    if ('errorMessage' in data) {
      const {errorMessage} = data;
      if (typeof errorMessage != 'string') throw InvalidCensusResponse.INCORRECT_RESPONSE(data);

      const errorCode = 'errorCode' in data ? data.errorCode : undefined;

      throw new CensusServerError(
        errorMessage,
        typeof errorCode == 'string' ? errorCode : undefined
      );
    }

    if (method == 'count') {
      if ('returned' in data && typeof data.returned == 'number')
        return data.returned;

      throw InvalidCensusResponse.NO_RETURN(data);
    }

    const listKey = collection ? `${collection}_list` : 'datatype_list';

    if (listKey in data) {
      const list: unknown = (data as any)[listKey];

      if (Array.isArray(list))
        return list;
    }

    throw InvalidCensusResponse.NO_LIST(data);
  }

  /**
   * Find params of collection
   */
  export async function getParams(collection: string): Promise<string[]> {
    try {
      await censusFetch(
        'get', collection, 'fakeparam=foo'
      );
    } catch (err) {
      if (err instanceof CensusError) {

        if (!err.message.startsWith('INVALID_SEARCH_TERM'))
          throw new Error(`No params found for ${collection}: ${err.message}`);

        const needle = 'Valid search terms: [';
        const cleanString = err.message.slice(
          err.message.indexOf(needle) + needle.length,
          -1,
        );

        return cleanString
          .split(', ')
          .sort();
      }

      throw err;
    }

    throw new Error(`No parameters for "${collection}" found`);
  }

  /**
   * Get type of a parameter
   */
  export async function getParamType(collection: string, param: string): Promise<CensusParamType> {
    try {
      await censusFetch(
        'get', collection, `${param}=foo`
      );

      return 'string';
    } catch (err) {
      if (err instanceof CensusError) {

        if (!err.message.startsWith('INVALID_SEARCH_TERM'))
          throw new Error(`No param ${param} found for ${collection}: ${JSON.stringify(err)}`);

        if (err.message.endsWith('Value must be a whole number.'))
          return 'integer';

        if (err.message.endsWith('Value must be a number.'))
          return 'float';

        if (err.message.includes('Value must be a whole number or a timestamp'))
          return 'timestamp';

        // TODO: find a boolean parameter and at it to the search
      }

      throw err;
    }
  }

  /**
   * Get values of parameters
   */
  export async function getParamValues(collection: string, param: string): Promise<string[] | undefined> {
    try {
      await censusFetch(
        'get', collection, `${param}=foo`
      );

      return; // No error, so no enum
    } catch (err) {
      if (err instanceof CensusError) {
        if (!err.message.startsWith('INVALID_SEARCH_TERM'))
          throw new Error(`No params found for ${collection}: ${err.message}`);

        // TODO: Implement
        const needle = 'Valid search terms: [';
        const cleanString: string = err.message.slice(
          err.message.indexOf(needle) + needle.length,
          -1,
        );

        return cleanString.split(', ');
      }

      throw err;
    }
  }

  /**
   * Find params of collection
   */
  export async function getResolvables(collection: string): Promise<string[]> {
    const req = await censusFetch(
      'get'
    );

    const row = req.find(({name}) => name == collection);

    if (!row)
      throw new Error(`Collection "${collection}" does not exist`);

    return row.resolve_list;
  }
}
