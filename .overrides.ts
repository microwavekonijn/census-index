import {OverridesCollection} from './utils/overrides.types.js';
import {
  CHARACTER_PARAM,
  CHARACTER_REQ_PARAM,
  EVENT_PARAMS,
  LEADERBOARD_PARAMS,
  WORLD_ZONE_PARAMS,
  WORLD_ZONE_REQ_PARAMS
} from '.overrides.constants.js';
import {CensusAPI} from './utils/census.js';

let cachedCharacterQuery: Promise<string> | undefined;
const characterQuery = () => {
  if (cachedCharacterQuery) return cachedCharacterQuery;

  return cachedCharacterQuery = CensusAPI
    .censusFetch('get', 'event', 'type=KILL')
    .then(r => `character_id=${r[0].character_id}`);
};

export const censusOverrides: Record<string, OverridesCollection> = {
  /** */
  map: {
    params: WORLD_ZONE_REQ_PARAMS,
    queryFactory: () => 'world_id=10&zone_ids=4',
  },
  /** */
  characters_world: {
    params: [
      {...CHARACTER_PARAM, alias: undefined},
      {name: 'world_id', type: 'string'},
    ],
  },
  /** */
  characters_online_status: {
    params: [
      CHARACTER_REQ_PARAM
    ],
    queryFactory: characterQuery,
  },
  /** */
  characters_friend: {
    params: [
      CHARACTER_REQ_PARAM
    ],
    queryFactory: characterQuery,
  },
  /** */
  leaderboard: {
    params: [...LEADERBOARD_PARAMS],
    queryFactory: () => 'name=Kills&period=Forever'
  },
  /** */
  characters_leaderboard: {
    params: [
      ...LEADERBOARD_PARAMS,
      CHARACTER_PARAM
    ],
    queryFactory: () => 'name=Kills&period=Forever'
  },
  /** */
  event: {
    params: [
      ...EVENT_PARAMS
    ],
    queryFactory: () => 'type=Kill' // Speed up query
  },
  /** */
  characters_event: {
    params: [
      CHARACTER_REQ_PARAM,
      ...EVENT_PARAMS,
    ],
    queryFactory: characterQuery
  },
  /** */
  world_event: {
    params: [
      ...WORLD_ZONE_PARAMS,
      ...EVENT_PARAMS,
    ],
    queryFactory: () => 'world_id=10' // Speed up query
  },
  /** */
  characters_event_grouped: {
    params: [
      CHARACTER_REQ_PARAM,
      {
        name: 'type',
        type: 'string',
        mutliple: true,
        values: ['DEATH', 'DEATHS', 'KILL', 'KILLS']
      }
    ],
    queryFactory: async () => `${await characterQuery()}&c:limit=1`
  },
  /** */
  single_character_by_id: {
    params: [
      CHARACTER_REQ_PARAM,
    ],
    queryFactory: characterQuery,
  },
  /** */
  characters_item: {
    params: [
      CHARACTER_REQ_PARAM,
    ],
    queryFactory: characterQuery,
  },
};