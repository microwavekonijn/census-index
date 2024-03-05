import {Command} from 'commander';
import * as fs from 'fs/promises';
import {CICollection} from './utils/indexed.types.ts';
import {compileDocument} from './utils/open-api.ts';

const program = new Command();

program
  .name('census-index')
  .description('CLI to manage specs of Census REST API')
  .version('0.0.1');

program.command('fetch')
  .description('Fetch ')
  .argument('[collection]', 'collection name')
  .option('--all', 'display just the first substring')
  // .option('-s, --separator <char>', 'separator character', ',')
  .action((collection, opts) => {

  });

program.command('compile')
  .description('Compile spec')
  // .option('--fetch-manifest', 'fetch manifest')
  // .option('--fetch-missing', 'fetch missing collections')
  // .option('--ignore-missing', 'ignore missing collections')
  .action(async () => {
    const collections: CICollection[] = [{
      version: 1,
      key: 'characters',
      params: [
        {name: 'character_id', type: 'string'}
      ],
      sample: {
        'character_id': '5428026242692781313',
        'name': {'first': 'Spke24', 'first_lower': 'spke24'},
        'faction_id': '3',
        'head_id': '3',
        'title_id': '0',
        'times': {
          'creation': '1357245683',
          'creation_date': '2013-01-03 20:41:23.0',
          'last_save': '1391251056',
          'last_save_date': '2014-02-01 10:37:36.0',
          'last_login': '1391250790',
          'last_login_date': '2014-02-01 10:33:10.0',
          'login_count': '89',
          'minutes_played': '3646'
        },
        'certs': {
          'earned_points': '1292',
          'gifted_points': '4',
          'spent_points': '1165',
          'available_points': '131',
          'percent_to_next': '0.2276111111117'
        },
        'battle_rank': {'percent_to_next': '11', 'value': '19'},
        'profile_id': '15',
        'daily_ribbon': {'count': '0', 'time': '1391209200', 'date': '2014-01-31 23:00:00.0'},
        'prestige_level': '0'
      },
      standardCollection: true
    }];
    const document = compileDocument(collections);

    const data = JSON.stringify(document);
    await fs.writeFile('census.spec.json', data);
  });

program.parse();
