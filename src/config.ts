import path from 'path';

import dotenv from 'dotenv';

dotenv.config({path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'dev'}`)});

class Config {
  // Application
  public NODE_ENV: string = process.env.NODE_ENV || 'dev';
  public PORT: number = parseInt(process.env.PORT || '4000', 10);

  public CLIENT_URL: string = process.env.CLIENT_URL || 'http://localhost:3000';

  // Services base URL
  public NOTIFICATIONS_BASE_URL: string = process.env.NOTIFICATIONS_BASE_URL || 'http://localhost:4001';
  public AUTH_BASE_URL: string = process.env.AUTH_BASE_URL || 'http://localhost:4002';
  public USERS_BASE_URL: string = process.env.USERS_BASE_URL || 'http://localhost:4003';
  public GIGS_BASE_URL: string = process.env.GIGS_BASE_URL || 'http://localhost:4004';
  public CHATS_BASE_URL: string = process.env.CHATS_BASE_URL || 'http://localhost:4005';
  public ORDERS_BASE_URL: string = process.env.ORDERS_BASE_URL || 'http://localhost:4006';
  public REVIEWS_BASE_URL: string = process.env.REVIEWS_BASE_URL || 'http://localhost:4007';

  // Redis
  public REDIS_URL: string = process.env.REDIS_URL || 'redis://localhost:6379';

  // JWT
  public JWT_ALGORITHM: string = process.env.JWT_ALGORITHM || 'RS256';
  public JWKS_URI: string = process.env.JWKS_URI || '';

  // Gateway secret for internal JWT & Cookie Session secret
  public GATEWAY_SECRET_KEY: string = process.env.GATEWAY_SECRET_KEY || '';
  public SECRET_KEY_ONE: string = process.env.SECRET_KEY_ONE || '';
  public SECRET_KEY_TWO: string = process.env.SECRET_KEY_TWO || '';

  public INTERNAL_TOKEN_EXPIRES_IN: string = process.env.INTERNAL_TOKEN_EXPIRES_IN || '';
  // APM
  public ENABLE_APM: boolean = process.env.ENABLE_APM === '1';
  public ELASTIC_APM_SERVER_URL: string = process.env.ELASTIC_APM_SERVER_URL || '';
  public ELASTIC_APM_SECRET_TOKEN: string = process.env.ELASTIC_APM_SECRET_TOKEN || '';

  constructor() {

  }

}

export const config = new Config();
