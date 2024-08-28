import {Command} from 'commander';
import * as path from 'path';
import {fileURLToPath} from 'url';
import {indexCommand} from './commands/index.js';
import {compileCommand} from './commands/compile.js';

const __filename = fileURLToPath(import.meta.url);
const DEFAULT_DIR = path.join(path.dirname(__filename), '.census');

const program = new Command();

program
  .name('census-index')
  .description('CLI to manage specs of Census REST API')
  .version('0.0.1');

program.command('index')
  .description('Index collection schemas')
  .argument('<collection...>', 'Names of collection to be indexed, accepts wildcard *')
  .action(async (collections: string[]) => {
    await indexCommand(collections, DEFAULT_DIR);
  });

program.command('compile')
  .description('Compile spec')
  .action(async () => {
    await compileCommand('census.spec.json', DEFAULT_DIR);
  });

program.parse();
