import * as process from 'node:process';
import {config} from 'dotenv';

config();

export namespace Config {
  export namespace census {
    export const serviceId: string = process.env.SERVICE_ID!;
  }
}