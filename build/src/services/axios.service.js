"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AxiosService = void 0;
var tslib_1 = require("tslib");
var config_1 = require("../config");
var axios_1 = tslib_1.__importDefault(require("axios"));
var jsonwebtoken_1 = require("jsonwebtoken");
var AxiosService = /** @class */ (function () {
    function AxiosService(baseUrl, serviceName) {
        this.axios = this.axiosCreateInstance(baseUrl, serviceName);
    }
    AxiosService.prototype.axiosCreateInstance = function (baseUrl, serviceName) {
        var requestGatewayToken = '';
        if (serviceName) {
            requestGatewayToken = (0, jsonwebtoken_1.sign)({ id: serviceName }, "".concat(config_1.config.GATEWAY_JWT_TOKEN));
        }
        var instance = axios_1.default.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                gatewayToken: requestGatewayToken
            },
            withCredentials: true
        });
        return instance;
    };
    return AxiosService;
}());
exports.AxiosService = AxiosService;
//# sourceMappingURL=axios.service.js.map