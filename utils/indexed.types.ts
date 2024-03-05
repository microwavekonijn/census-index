import {CensusRecord} from "./census.js";

export interface CICollection {
  version: number;
  key: string;
  standardCollection: boolean;
  params: {
    name: string;
    type: 'string' | 'float' | 'integer' | 'timestamp' | 'boolean';
    values?: string[];
  }[];
  resolvables?: string[];
  sample: CensusRecord;
}