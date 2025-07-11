"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
var http_status_codes_1 = require("http-status-codes");
var HealthController = /** @class */ (function () {
    function HealthController() {
    }
    HealthController.prototype.health = function (_req, res) {
        res.status(http_status_codes_1.StatusCodes.OK).send('Gateway Service is healthy and OK');
    };
    return HealthController;
}());
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map