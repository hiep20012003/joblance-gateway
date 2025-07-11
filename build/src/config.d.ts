declare class Config {
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
    constructor();
}
export declare const config: Config;
export {};
