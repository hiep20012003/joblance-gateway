"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddlerware = void 0;
var config_1 = require("../config");
var joblance_shared_1 = require("@hiep20012003/joblance-shared");
var jsonwebtoken_1 = require("jsonwebtoken");
var AuthMiddlerware = /** @class */ (function () {
    function AuthMiddlerware() {
    }
    AuthMiddlerware.prototype.verifyUser = function (req, _res, next) {
        var _a, _b;
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt)) {
            throw new joblance_shared_1.NotAuthorizedError('Token is not available. Please log in again.', 'Error in GatewayService: verifyUser()');
        }
        try {
            var payload = (0, jsonwebtoken_1.verify)((_b = req.session) === null || _b === void 0 ? void 0 : _b.jwt, "".concat(config_1.config.JWT_TOKEN));
            req.currentUser = payload;
        }
        catch (error) {
            throw new joblance_shared_1.NotAuthorizedError('Token is not available. Please log in again.', 'Error in GatewayService: verifyUser()');
        }
        next();
    };
    AuthMiddlerware.prototype.checkAuthentication = function (req, _res, next) {
        if (!req.currentUser) {
            throw new joblance_shared_1.BadRequestError('Authentication is required to access this route.', 'Error in GatewayService: checkAuthentication()');
        }
        next();
    };
    return AuthMiddlerware;
}());
exports.authMiddlerware = new AuthMiddlerware();
//# sourceMappingURL=auth.middleware.js.map