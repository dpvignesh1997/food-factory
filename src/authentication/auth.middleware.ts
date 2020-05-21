import { Request, Response, NextFunction } from 'express';
import { TokenModel } from "../";
import { Model } from 'mongoose';
import moment = require('moment');
import { Messages } from "../messages";

export class AuthMiddleware {
    Token: Model<any> = new TokenModel().getModel()
    constructor() { }

    created_by = [
        '/vendor',
        '/ingredient',
        '/food',
        '/order'
    ]

    methods = ['POST', 'PUT']

    authenticate = (req: Request, res: Response, next: NextFunction) => {
        if ((this.created_by.includes(req.path) && this.methods.includes(req.method))) {
            let token: string = ''
            try {
                token = req.headers.authorization.split(' ')[1]
            } catch (error) {
                res.status(401).json({
                    message: Messages.NO_AUTH
                })
                return
            }
            this.Token.findOne({ token, expiration: { $gte: moment.utc() } }, (err, user) => {
                if (err) {
                    res.status(401).json({
                        message: Messages.NO_AUTH
                    })
                    return
                }
                if (!user) {
                    res.status(401).json({
                        message: Messages.NO_AUTH
                    })
                    return
                }
                req.body['created_by'] = user['user']['_id']
                setTimeout(() => {
                    next();
                }, 4000);
                return
            })
        } else {
            next();
        }
    }
}