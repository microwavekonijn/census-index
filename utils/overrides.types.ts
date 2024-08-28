import {IndexedCollection} from './indexed.types.js';

export interface OverridesCollection {
  params?: IndexedCollection['params'];
  queryFactory?: () => Promise<string> | string;
}
