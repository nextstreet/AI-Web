import * as migration_20261022_044325_initial from './20261022_044325_initial';

export const migrations = [
  {
    up: migration_20261022_044325_initial.up,
    down: migration_20261022_044325_initial.down,
    name: '20261022_044325_initial'
  },
];
