"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("../");
const passport_1 = require("../session/passport");
/**
 * Definition for Session Routes
 * @exports SessionRoutes
 * @access constructor
 * @classdesc Class for Managing Session Routes
 */
class SessionRoutes {
    constructor() {
        // Passport Authentication reference
        this.passport = new passport_1.PassportService().passport;
        // Express Router
        this.router = express_1.Router();
        // Session Class reference
        this._session = new __1.Session();
        // Set Passport Session
        this.session = {
            session: false
        };
        // Initialize SessionRoutes
        this._sessionRoutes();
    }
    // Create Session Routes
    _sessionRoutes() {
        // Route for Signin
        this.router.post('/signin', this._session.signin);
        // Route for Signup
        this.router.post('/signup', this._session.signup);
        // Route for Change Password
        this.router.post('/changePassword', this._session.changePassword);
        // Route for Forgot Password
        this.router.post('/forgotPassword', this._session.forgotPassword);
        // Route for Email Availability Check
        this.router.post('/checkEmailAvailablity', this._session.checkEmailAvailablity);
        // Route for Username Availability Check
        this.router.post('/checkUserNameAvailablity', this._session.checkUserNameAvailablity);
        // Route for Logout
        this.router.post('/logout', this.passport.authenticate('bearer', this.session), this._session.logout);
        // Route for Deactivate User
        this.router.post('/deactivateUser', this.passport.authenticate('bearer', this.session), this._session.deactivateUser);
    }
}
exports.SessionRoutes = SessionRoutes;
//# sourceMappingURL=session.routers.js.map