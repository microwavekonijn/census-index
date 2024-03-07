import * as fs from 'fs/promises';
import * as path from 'path';
import {IndexedCollection} from './indexed.types.ts';

// export interface IndexedCollection {
//   collection: string;
//   params: {
//     name: string;
//     type: 'string' | 'float' | 'integer' | 'timestamp' | 'boolean';
//     values?: string[];
//   }[];
//   sample: CensusRecord;
// }

export class CIManager {
  constructor(private readonly dir: string) {
  }

  async getManifest(): Promise<string[]> {
    const data = await fs.readFile(path.join(this.dir, 'manifest.json'));

    return JSON.parse(data.toString());
  }

  async updateManifest(collections: string[]): Promise<void> {
    const data = JSON.stringify(collections);

    await fs.writeFile(path.join(this.dir, 'manifest.json'), data);
  }

  async getCollection(collection: string): Promise<IndexedCollection> {
    const data = await fs.readFile(path.join(this.dir, `${collection}.json`));

    return JSON.parse(data.toString());
  }

  async updateCollection(collection: IndexedCollection): Promise<void> {
    const data = JSON.stringify(collection);

    await fs.writeFile(path.join(this.dir, `${collection}.json`), data);
  }
}