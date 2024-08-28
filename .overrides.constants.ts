import {OverridesCollection} from './utils/overrides.types.js';
import {ArrayValue} from './utils/helpers/types.js';

type Params = NonNullable<OverridesCollection['params']>;

export const CHARACTER_PARAM: ArrayValue<Params> = {
  name: 'character_id ',
  alias: 'id',
  type: 'string',
  mutliple: true
};

export const CHARACTER_REQ_PARAM: ArrayValue<Params> = {
  ...CHARACTER_PARAM,
  required: true
};

export const WORLD_ZONE_PARAMS: Params = [
  {name: 'world_id', type: 'string'},
  {name: 'zone_ids', type: 'string', mutliple: true}
];

export const WORLD_ZONE_REQ_PARAMS: Params = [
  ...WORLD_ZONE_PARAMS.map(p => ({...p, required: true as true}))
];

export const LEADERBOARD_PARAMS: Params = [
  {
    name: 'name',
    type: 'string',
    values: [
      'Deaths',
      'Kills',
      'Score',
      'Time'
    ]
  },
  {
    name: 'period',
    type: 'string',
    values: [
      'Forever',
      'Monthly',
      'Weekly',
      'Daily',
      'OneLife'
    ]
  },
  {
    name: 'world',
    type: 'string',
  }
];

export const EVENT_PARAMS: Params = [
  {name: 'before', type: 'integer'},
  {name: 'after', type: 'integer'},
  {
    name: 'type',
    type: 'string',
    mutliple: true,
    values: ['BATTLE_RANK', 'ITEM', 'ACHIEVEMENT', 'DEATH', 'KILL', 'VEHICLE_DESTROY', 'FACILITY_CHARACTER']
  }
];