"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_http_bearer_1 = require("passport-http-bearer");
const Passport = require("passport");
const __1 = require("..");
const moment = require("moment");
/**
 * Definition for Passport OAuth 2.0 (Bearer Token)
 * @exports PassportService
 * @access constructor
 * @classdesc Class for Session Authorization and Authentication Middleware for Authorized Routes
 */
class PassportService {
    constructor() {
        // Token Model Reference
        this.Token = new __1.TokenModel().getModel();
        // Implentation of Passport Strategy
        this.passport = Passport.use(new passport_http_bearer_1.Strategy((token, done) => {
            // Check if Token is Valid
            this.Token.findOne({ token: token, expiration: { $gte: moment.utc().toDate() } }, (err, user) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                try {
                    // If Token is Valid Reset the Token Expiration
                    yield this.Token.updateOne({ token: user['token'] }, {
                        $set: {
                            expiration: moment.utc().add(+process.env['EXPIRATION'], 'hours')
                        }
                    }).exec();
                }
                catch (error) {
                    return done(error, null);
                }
                return done(null, user);
            }));
        }));
    }
}
exports.PassportService = PassportService;
//# sourceMappingURL=passport.js.map