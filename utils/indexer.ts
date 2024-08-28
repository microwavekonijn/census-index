import {IndexedCollection, IndexedParam} from './indexed.types.js';
import {CensusAPI} from './census.js';
import {censusOverrides} from '../.overrides.js';

export namespace Indexer {
  export async function indexCollection(name: string): Promise<IndexedCollection> {
    const [params, sample] = await Promise.all([
      indexParameters(name),
      sampleCollection(name),
    ]);

    return {
      version: 1,
      key: name,
      params,
      sample,
    };
  }

  export async function indexParameters(collection: string): Promise<IndexedCollection['params']> {
    if (censusOverrides[collection]?.params)
      return censusOverrides[collection].params!;

    const paramsNames = await CensusAPI.getParams(collection);

    return Promise.all(paramsNames.map(p => indexParameter(collection, p)));
  }

  export async function indexParameter(collection: string, name: string): Promise<IndexedParam> {
    const type = await CensusAPI.getParamType(collection, name);

    const values = type == 'string'
      ? await CensusAPI.getParamValues(collection, name)
      : undefined;


    const param: IndexedParam = {name, type, values};

    return param;
  }

  export async function sampleCollection(collection: string): Promise<IndexedCollection['sample']> {
    const params = await censusOverrides[collection]?.queryFactory?.();
    const data = await CensusAPI.censusFetch('get', collection, params);

    if (data.length == 0)
      throw new Error(`Request returned no samples for "${collection}" with parameters: ${params ?? '(none)'}`);

    return data[0];
  }
}