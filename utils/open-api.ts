import {IndexedCollection} from './indexed.types.ts';
import {OpenAPIV3 as OpenAPISpec} from 'openapi-types';
import {getLargestVersion, toCamelCase} from './utils.ts';
import {CensusRecord} from './census.ts';
import {RecordValue} from './types.ts';

interface CompileResult {
  version: string;
  collectionKey: string;
  schema: OpenAPISpec.SchemaObject;
  parameters: OpenAPISpec.ParameterObject[];
}

export function compileDocument(collections: IndexedCollection[]): OpenAPISpec.Document {
  const ERROR_COMP = 'CensusError';
  const COUNT_COMP = 'Count';

  return collections
    .map(compileCollection)
    .reduce<OpenAPISpec.Document<{ }>>(
      (doc, collection) => {
        // TODO: add xml support
        const schemaKey = toCamelCase(collection.collectionKey);
        const pathGet = `/{serviceId}/get/{environment}/${collection.collectionKey}`;
        const pathCount = `/{serviceId}/count/{environment}/${collection.collectionKey}`;

        doc.info.version = getLargestVersion(doc.info.version, collection.version);
        doc.components!.schemas![schemaKey] = collection.schema;
        doc.paths![pathGet] = {
          parameters: [
            ...collection.parameters,
            {$ref: '#/components/parameters/serviceId'},
            {$ref: '#/components/parameters/environment'}
          ],
          get: {
            responses: {
              200: {
                description: '',
                content: {
                  'application/json': {
                    schema: {
                      oneOf: [
                        {
                          type: 'object',
                          properties: {
                            [`${collection.collectionKey}_list`]: {
                              type: 'array',
                              items: {$ref: `#/components/schemas/${schemaKey}`}
                            },
                            returned: {type: 'integer'}
                          }
                        },
                        {$ref: `#/components/schemas/${ERROR_COMP}`}
                      ]
                    }
                  },
                }
              }
            }
          }
        };

        doc.paths![pathCount] = {
          parameters: [
            {$ref: '#/components/parameters/serviceId'},
            {$ref: '#/components/parameters/environment'}
          ],
          get: {
            responses: {
              200: {
                description: '',
                content: {
                  'application/json': {schema: {$ref: `#/components/schemas/${COUNT_COMP}`}}
                }
              }
            }
          }
        };

        return doc;
      },
      {
        openapi: '3.0.3',
        info: {
          title: 'Census REST API',
          version: '1',
        },
        servers: [
          {url: 'https://census.daybreakgames.com/'}
        ],
        components: {
          schemas: {
            [ERROR_COMP]: errorSchema(),
            [COUNT_COMP]: countSchema(),
          },
          parameters: {
            serviceId: {
              name: 'serviceId',
              in: 'path',
              schema: {type: 'string'},
              required: true,
              example: 's:example'
            },
            environment: {
              name: 'environment',
              in: 'path',
              schema: {type: 'string', enum: ['ps2:v2', 'ps2ps4eu:v2', 'ps2ps4us:v2']},
              required: true,
            }
          }
        },
        paths: {
          '/{serviceId}/get/{environment}/': {
            parameters: [
              {$ref: '#/components/parameters/serviceId'},
              {$ref: '#/components/parameters/environment'}
            ],
            get: {
              responses: {
                200: {
                  description: '',
                  content: {
                    'application/json': {schema: indexSchema()}
                  }
                }
              }
            }
          }
        },
      } satisfies OpenAPISpec.Document);
}

export function compileCollection(collection: IndexedCollection): CompileResult {
  return {
    version: '1.0.0',
    collectionKey: collection.key,
    schema: {
      type: 'object',
      properties: Object.fromEntries(
        Object
          .entries(collection.sample)
          .map(([key, value]) => [key, compileCollectionSchema(key, value, collection.sample)]))
    },
    parameters: collection.params.map(p => ({
      name: p.name,
      in: 'query',
      schema: {type: 'string'}
    })),
  };
}

export function compileCollectionSchema(key: string, sample: RecordValue<CensusRecord>, context: CensusRecord): OpenAPISpec.SchemaObject {
  // TODO: add example
  if (typeof sample == 'string')
    return {
      type: 'string',
      // $schema: inferType(key, context),
    };

  if (Array.isArray(sample))
    return {
      type: 'array',
      items: compileCollectionSchema(key, sample[0], context)
    };

  return {
    type: 'object',
    properties: Object.fromEntries(
      Object
        .entries(sample)
        .map(([key, value]) => [key, compileCollectionSchema(key, value, sample)]))
  };
}

export function inferType(key: string, context: CensusRecord) {
  if (key.endsWith('_id'))
    return 'id';

  if (key.endsWith('_date') || key == 'date')
    return 'date';

  if (key.includes('count') || key.includes('played'))
    return 'integer';

  if (key.includes('percent'))
    return 'number';

  if (`${key}_date` in context || key == 'time')
    return 'epoch';

  return 'string';
}

export function indexSchema(): OpenAPISpec.SchemaObject {
  return {
    type: 'object',
    properties: {
      datatype_list: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            count: {
              oneOf: [
                {type: 'integer'},
                {type: 'string', enum: ['dynamic', '?']}
              ]
            },
            hidden: {
              oneOf: [
                {type: 'string', enum: ['false']},
                {type: 'boolean', enum: [false]}
              ]
            },
            name: {type: 'string'},
            resolve_list: {type: 'array', items: {type: 'string'}}
          }
        }
      },
      returned: {type: 'integer'}
    }
  };
}

export function countSchema(): OpenAPISpec.SchemaObject {
  return {
    type: 'object',
    properties: {count: {type: 'integer'}}
  };
}

export function errorSchema(): OpenAPISpec.SchemaObject {
  return {
    oneOf: [
      {
        type: 'object',
        properties: {
          errorCode: {type: 'string'},
          errorMessage: {type: 'string'}
        }
      },
      {
        type: 'object',
        properties: {
          error: {type: 'string'}
        }
      }
    ]
  };
}