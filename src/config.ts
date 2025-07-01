import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

class Config {
  GATEWAY_JWT_TOKEN: string | undefined;
  JWT_TOKEN: string | undefined;
  NODE_ENV: string | undefined;
  SECRET_KEY_ONE: string | undefined;
  SECRET_KEY_TWO: string | undefined;
  CLIENT_URL: string | undefined;
  AUTH_BASE_URL: string | undefined;
  USERS_BASE_URL: string | undefined;
  GIG_BASE_URL: string | undefined;
  MESSAGE_BASE_URL: string | undefined;
  ORDER_BASE_URL: string | undefined;
  REVIEW_BASE_URL: string | undefined;
  REDIS_HOST: string | undefined;
  ELASTIC_SEARCH_URL: string | undefined;
  ELASTIC_APM_SERVER_URL: string | undefined;
  ELASTIC_APM_SECRET_TOKEN: string | undefined;
  PORT: string | undefined;
  LOG_LEVEL: string | undefined;
  ENABLE_APM: string | undefined;

  constructor() {
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.AUTH_BASE_URL = process.env.AUTH_BASE_URL || '';
    this.USERS_BASE_URL = process.env.USERS_BASE_URL || '';
    this.GIG_BASE_URL = process.env.GIG_BASE_URL || '';
    this.MESSAGE_BASE_URL = process.env.MESSAGE_BASE_URL || '';
    this.ORDER_BASE_URL = process.env.ORDER_BASE_URL || '';
    this.REVIEW_BASE_URL = process.env.REVIEW_BASE_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || '';
    this.ELASTIC_APM_SECRET_TOKEN = process.env.ELASTIC_APM_SECRET_TOKEN || '';
    this.PORT = process.env.PORT || '';
    this.LOG_LEVEL = process.env.LOG_LEVEL || '';
    this.ENABLE_APM = process.env.ENABLE_APM || '';
  }
}

export const config: Config = new Config();
