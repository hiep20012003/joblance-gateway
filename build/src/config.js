"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var tslib_1 = require("tslib");
var dotenv_1 = tslib_1.__importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env.".concat(process.env.ENVIRONMENT || 'dev') });
var Config = /** @class */ (function () {
    function Config() {
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
    return Config;
}());
exports.config = new Config();
//# sourceMappingURL=config.js.map