"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = void 0;
var health_route_1 = require("./routes/health.route");
var appRoutes = function (app) {
    app.use('', health_route_1.healthRoutes.routes());
};
exports.appRoutes = appRoutes;
//# sourceMappingURL=routes.js.map