"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = void 0;
var tslib_1 = require("tslib");
var health_controller_1 = require("../controllers/health.controller");
var express_1 = tslib_1.__importDefault(require("express"));
var HealthRoutes = /** @class */ (function () {
    function HealthRoutes() {
        this.router = express_1.default.Router();
    }
    HealthRoutes.prototype.routes = function () {
        this.router.get('/gateway-health', health_controller_1.HealthController.prototype.health);
        return this.router;
    };
    return HealthRoutes;
}());
exports.healthRoutes = new HealthRoutes();
//# sourceMappingURL=health.route.js.map