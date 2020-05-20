import { Strategy } from 'passport-http-bearer'
import * as Passport from 'passport'
import { TokenModel, tokenInterface } from "..";
import { Model } from 'mongoose';
import moment = require('moment');

/**
 * Definition for Passport OAuth 2.0 (Bearer Token)
 * @exports PassportService
 * @access constructor
 * @classdesc Class for Session Authorization and Authentication Middleware for Authorized Routes
 */
export class PassportService {
    // Token Model Reference
    Token: Model<tokenInterface> = new TokenModel().getModel()

    // Implentation of Passport Strategy
    passport = Passport.use(new Strategy((token, done) => {

        // Check if Token is Valid
        this.Token.findOne({ token: token, expiration: { $gte: moment.utc().toDate() } }, async (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            try {
                // If Token is Valid Reset the Token Expiration
                await this.Token.updateOne({ token: user['token'] }, {
                    $set: {
                        expiration: moment.utc().add(+process.env['EXPIRATION'], 'hours')
                    }
                }).exec();
            } catch (error) {
                return done(error, null);
            }
            return done(null, user);
        })
    }))

    constructor() { }
}