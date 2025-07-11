"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
var tslib_1 = require("tslib");
var express_1 = tslib_1.__importDefault(require("express"));
var joblance_shared_1 = require("@hiep20012003/joblance-shared");
var server_1 = require("./server");
exports.logger = new joblance_shared_1.Logger('GatewayService');
var Application = /** @class */ (function () {
    function Application() {
    }
    Application.prototype.initialize = function () {
        var app = (0, express_1.default)();
        var server = new server_1.GatewayServer(app);
        server.start();
        exports.logger.info('Gateway Service initialized');
    };
    return Application;
}());
var application = new Application();
application.initialize();
//# sourceMappingURL=app.js.map