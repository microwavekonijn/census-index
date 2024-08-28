import {CensusRecord} from "./census.types.js";
import {CensusParamType} from './census.types.ts';

export type IndexedParamType = CensusParamType;

export interface IndexedParam {
  name: string;
  alias?: string;
  required?: true;
  type: IndexedParamType;
  values?: string[];
  mutliple?: true;
}

export interface IndexedCollection {
  version: number;
  key: string;
  params: IndexedParam[];
  resolvables?: string[];
  sample: CensusRecord;
}