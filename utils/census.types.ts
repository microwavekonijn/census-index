export type CensusErrorResponse =
  | { error: string }
  | { errorMessage: string, errorCode: string };

export type CensusValue = CensusRecord | string | CensusRecord[] | string[];

export interface CensusRecord {
  [K: string]: CensusValue;
}

export type CensusParamType = 'string' | 'float' | 'integer' | 'timestamp' | 'boolean';