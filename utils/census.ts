export type CensusError =
  | { error: string }
  | { errorMessage: string, errorCode: string };

export interface CensusRecord {
  [K: string]: CensusRecord | string | CensusRecord[] | string[];
}

export class CensusAPI {
  constructor(
    private readonly serviceId: string,
    private readonly namespace: 'ps2' | 'ps2ps4eu' | 'ps2ps4us',
    private readonly baseUrl = 'https://census.daybreakgames.com'
  ) {
  }

  fetch(method: 'get'): Promise<{
    name: string,
    count: number | '?' | 'dynamic',
    hidden: false | 'false',
    resolve_list: string[]
  }[]>;
  fetch(method: 'get',
        collection: string,
        params?: string): Promise<CensusRecord[]>;
  fetch(method: 'count',
        collection: string,
        params?: string): Promise<number>;
  fetch(
    method: 'count' | 'get',
    collection?: string,
    params?: string,
  ): Promise<any> {
    // Build url
    let url = `${this.baseUrl}/s:${this.serviceId}/${method}/${this.namespace}`;

    if (collection) {
      url += `/${collection}`;

      if (params) url += `?` + params;
    }

    return fetch(url).then(res => res.json())
      .then((data: any) => {
        if ('error' in data || 'errorMessage' in data || 'errorCode' in data)
          throw data;

        if (method == 'count')
          return data.returned;

        return collection
          ? data[`${collection}_list`]
          : data.datatype_list;
      });
  }

  /**
   * Find params of collection
   */
  async getParams(collection: string): Promise<string[]> {
    const req = this.fetch(
      'get', collection, 'fakeparam=foo'
    );

    const err = await req.catch(err => err);
    if (!err || !err.errorMessage?.startsWith('INVALID_SEARCH_TERM'))
      throw new Error(`No params found for ${collection}: ${JSON.stringify(await req)}`);

    const needle = 'Valid search terms: [';
    const cleanString: string = err.errorMessage.slice(
      err.errorMessage.indexOf(needle) + needle.length,
      -1,
    );

    return cleanString
      .split(', ')
      .sort();
  }

  /**
   * Get type of a parameter
   */
  async getParamType(collection: string, param: string): Promise<'string' | 'number' | 'integer' | 'timestamp'> {
    const req = this.fetch(
      'get', collection, `${param}=foo`
    );

    const err = await req.catch(err => err);
    if (!err || !err.errorMessage?.startsWith('INVALID_SEARCH_TERM'))
      throw new Error(`No params found for ${collection}: ${JSON.stringify(await req)}`);

    // TODO: Implement
    return 'string';
  }

  /**
   * Get values of parameters
   */
  async getParamValues(collection: string, param: string): Promise<string[] | null> {
    const req = this.fetch(
      'get', collection, `${param}=foo`
    );

    const err = await req.catch(err => err);
    if (!err || !err.errorMessage?.startsWith('INVALID_SEARCH_TERM'))
      throw new Error(`No params found for ${collection}: ${JSON.stringify(await req)}`);

    // TODO: Implement
    const needle = 'Valid search terms: [';
    const cleanString: string = err.errorMessage.slice(
      err.errorMessage.indexOf(needle) + needle.length,
      -1,
    );

    return cleanString.split(', ');
  }

  /**
   * Find params of collection
   */
  async getResolvables(collection: string): Promise<string[]> {
    const req = await this.fetch(
      'get'
    );

    const row = req.find(({name}) => name == collection);

    if (!row)
      throw new Error(`Collection "${collection}" could not be found`);

    return row.resolve_list;
  }
}