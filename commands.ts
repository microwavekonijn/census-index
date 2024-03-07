import {Command} from 'commander';
import * as fs from 'fs/promises';
import {compileDocument} from './utils/open-api.ts';
import {fetchCollections, storeCollection} from './utils/storage.js';
import * as path from 'path';
import {CensusAPI} from './utils/census.js';
import {IndexedCollection} from './utils/indexed.types.js';
import {fileURLToPath} from 'url';
import * as console from 'console';

const __filename = fileURLToPath(import.meta.url);
const DEFAULT_DIR = path.join(path.dirname(__filename), '.census');

const program = new Command();

program
  .name('census-index')
  .description('CLI to manage specs of Census REST API')
  .version('0.0.1');

program.command('fetch')
  .description('Fetch ')
  // .argument('[collection]', 'collection name')
  // .option('--all', 'display just the first substring')
  // .option('-s, --separator <char>', 'separator character', ',')
  .action(async () => {
    try {
      const api = new CensusAPI('microwavekonijn', 'ps2');
      const collections = await api.fetch('get');

      await Promise.all(collections.map(async collection => {
        const [params, sample] = await Promise.all([
          api.getParams(collection.name).catch(() => []),
          api.fetch('get', collection.name).catch(() => []),
        ]);

        const index: IndexedCollection = {
          version: 1,
          key: collection.name,
          standardCollection: true,
          params: params.map(p => ({name: p, type: 'string'})),
          sample: sample[0] ?? {},
        };

        await storeCollection(index, {dir: DEFAULT_DIR});
      }));
    } catch (e) {
      console.log(e);
    }
  });

program.command('compile')
  .description('Compile spec')
  // .option('--fetch-manifest', 'fetch manifest')
  // .option('--fetch-missing', 'fetch missing collections')
  // .option('--ignore-missing', 'ignore missing collections')
  .action(async () => {
    const collections = await fetchCollections({dir: DEFAULT_DIR});
    const document = compileDocument(collections);
    const data = JSON.stringify(document);

    await fs.writeFile('census.spec.json', data);
  });

program.parse();
