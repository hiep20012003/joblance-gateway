"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GatewayServer = void 0;
var tslib_1 = require("tslib");
var http_1 = tslib_1.__importDefault(require("http"));
var express_1 = require("express");
var cookie_session_1 = tslib_1.__importDefault(require("cookie-session"));
var hpp_1 = tslib_1.__importDefault(require("hpp"));
var helmet_1 = tslib_1.__importDefault(require("helmet"));
var cors_1 = tslib_1.__importDefault(require("cors"));
var compression_1 = tslib_1.__importDefault(require("compression"));
var http_status_codes_1 = require("http-status-codes");
var config_1 = require("./config");
// import { elasticsearch } from './elasticsearch';
var joblance_shared_1 = require("@hiep20012003/joblance-shared");
var routes_1 = require("./routes");
var app_1 = require("./app");
var SERVER_PORT = config_1.config.PORT || 4000;
var GatewayServer = /** @class */ (function () {
    function GatewayServer(app) {
        this.app = app;
    }
    GatewayServer.prototype.start = function () {
        this.securityMiddleware(this.app);
        this.standarMiddleware(this.app);
        this.routesMiddleware(this.app);
        this.errorHandlerMiddleware(this.app);
        this.startServer(this.app);
    };
    GatewayServer.prototype.securityMiddleware = function (app) {
        app.set('trust proxy', 1);
        app.use((0, cookie_session_1.default)({
            name: 'session',
            keys: ["".concat(config_1.config.SECRET_KEY_ONE), "".concat(config_1.config.SECRET_KEY_TWO)],
            maxAge: 24 * 7 * 3600000,
            secure: config_1.config.NODE_ENV !== 'development'
            // sameSite: none
        }));
        app.use((0, hpp_1.default)());
        app.use((0, helmet_1.default)());
        app.use((0, cors_1.default)({
            origin: config_1.config.CLIENT_URL,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }));
    };
    GatewayServer.prototype.standarMiddleware = function (app) {
        app.use((0, compression_1.default)());
        app.use((0, express_1.json)({ limit: '200mb' }));
        app.use((0, express_1.urlencoded)({ extended: true, limit: '200mb' }));
    };
    GatewayServer.prototype.routesMiddleware = function (app) {
        (0, routes_1.appRoutes)(app);
    };
    // private startElasticSearch(): void {
    //   elasticsearch.checkConnection();
    // }
    GatewayServer.prototype.errorHandlerMiddleware = function (app) {
        app.use('*', function (req, res, _next) {
            var fullUrl = "".concat(req.protocol, "://").concat(req.get('host')).concat(req.originalUrl);
            var notFoundError = new joblance_shared_1.NotFoundError("Endpoint not found: ".concat(fullUrl), 'GatewayService.errorHandler', 'ENDPOINT_NOT_FOUND');
            app_1.logger.error(notFoundError);
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json(notFoundError.serialize());
        });
        app.use((0, joblance_shared_1.errorHandler)(app_1.logger));
    };
    GatewayServer.prototype.startServer = function (app) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var httpServer, error_1, err;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        httpServer = new http_1.default.Server(app);
                        return [4 /*yield*/, this.startHttpServer(httpServer)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        err = new joblance_shared_1.ServerError('Failed to start GatewayService server', 'GatewayService.startServer', 'SERVER_START_FAILURE');
                        app_1.logger.error(err);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GatewayServer.prototype.startHttpServer = function (httpServer) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var err;
            return tslib_1.__generator(this, function (_a) {
                try {
                    app_1.logger.info("Gateway server started with process id ".concat(process.pid));
                    httpServer.listen(SERVER_PORT, function () {
                        app_1.logger.info("Gateway server is running on port ".concat(SERVER_PORT));
                    });
                }
                catch (error) {
                    err = new joblance_shared_1.DependencyError('Failed to bind HTTP port', 'GatewayService.startHttpServer', 'PORT_BIND_FAILURE');
                    app_1.logger.error(err);
                }
                return [2 /*return*/];
            });
        });
    };
    return GatewayServer;
}());
exports.GatewayServer = GatewayServer;
//# sourceMappingURL=server.js.map