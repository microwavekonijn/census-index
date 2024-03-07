import * as fs from 'fs/promises';
import {IndexedCollection} from './indexed.types.js';
import * as path from 'path';

export interface StorageOptions {
  dir: string;
}

export async function fetchCollections(opts: StorageOptions): Promise<IndexedCollection[]> {
  const files: string[] = await fs.readdir(opts.dir)
    .then(res => res
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(opts.dir, f)));

  return Promise.all(files.map(async file => {
    const data = await fs.readFile(file);

    return JSON.parse(data.toString()) satisfies IndexedCollection;
  }));
}

export async function storeCollection(collection: IndexedCollection, opts: StorageOptions) {
  const filePath = path.join(opts.dir, `${collection.key}.json`);
  const content = JSON.stringify(collection);

  await fs.writeFile(filePath, content);
}