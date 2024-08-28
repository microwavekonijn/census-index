import {fetchCollections} from '../utils/storage.js';
import {compileDocument} from '../utils/open-api.js';
import fs from 'fs/promises';
import {Console} from '../utils/helpers/console.js';

export async function compileCommand(documentName: string, storageDir: string) {
  Console.loading('Compiling');
  const collections = await fetchCollections({dir: storageDir});
  const document = compileDocument(collections);
  const data = JSON.stringify(document);

  await fs.writeFile(documentName, data);
  Console.writeLastLine(`Spec compiled: ${documentName}`);
}