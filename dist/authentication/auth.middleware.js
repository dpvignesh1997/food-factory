"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const moment = require("moment");
const messages_1 = require("../messages");
class AuthMiddleware {
    constructor() {
        this.Token = new __1.TokenModel().getModel();
        this.created_by = [
            '/vendor',
            '/ingredient',
            '/food'
        ];
        this.methods = ['POST', 'PUT'];
        this.authenticate = (req, res, next) => {
            if ((this.created_by.includes(req.path) && this.methods.includes(req.method))) {
                let token = '';
                try {
                    token = req.headers.authorization.split(' ')[1];
                }
                catch (error) {
                    res.status(401).json({
                        message: messages_1.Messages.NO_AUTH
                    });
                    return;
                }
                this.Token.findOne({ token, expiration: { $gte: moment.utc() } }, (err, user) => {
                    if (err) {
                        res.status(401).json({
                            message: messages_1.Messages.NO_AUTH
                        });
                        return;
                    }
                    if (!user) {
                        res.status(401).json({
                            message: messages_1.Messages.NO_AUTH
                        });
                        return;
                    }
                    req.body['created_by'] = user['user']['_id'];
                    setTimeout(() => {
                        next();
                    }, 4000);
                    return;
                });
            }
            else {
                next();
            }
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=auth.middleware.js.map