import {Console} from '../utils/helpers/console.js';
import {CensusAPI} from '../utils/census.js';
import {wildcardMatch} from '../utils/helpers/wildcard_match.js';
import {Indexer} from '../utils/indexer.js';
import {storeCollection} from '../utils/storage.js';

export async function indexCommand(collections: string[], storageDir: string): Promise<void> {
  Console.loading('Fetching manifest');

  const manifest = await CensusAPI.censusFetch('get');

  collections = manifest.map(c => c.name)
    .filter(c => collections.some(n => wildcardMatch(c, n.toLowerCase())));

  if (!collections.length) {
    Console.writeLastLine('No collections found');
    return;
  }

  Console.writeLine(`Found ${collections.length} collections`);

  let complete = 0;
  let failed = 0;

  const printProgress = () => Console.loading(`Progress(${Math.round((complete + failed) / collections.length * 1000) / 10}%): completed ${complete}, failed ${failed}`);
  const incComplete = () => {
    complete++;
    printProgress();
  };
  const incFailed = () => {
    failed++;
    printProgress();
  };

  printProgress();

  const indexer = collections.map(async c => {
    try {
      const indexed = await Indexer.indexCollection(c);
      await storeCollection(indexed, {dir: storageDir});

      Console.writeLine(`Indexed "${c}"`);
      incComplete();
    } catch (err) {
      Console.writeLine(`Failed to index "${c}": ${err}`);
      incFailed();
    }
  });

  await Promise.all(indexer);
  if (!failed)
    Console.writeLastLine(`Finished indexing ${collections.length} collection(s).`);
  else
    Console.writeLastLine(`Finished indexing ${collections.length} collection(s) (failed ${failed}).`);
}