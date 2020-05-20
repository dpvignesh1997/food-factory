import { Router } from 'express'
import {
    Session,
} from '../'
import { PassportService } from "../session/passport";

/**
 * Definition for Session Routes
 * @exports SessionRoutes
 * @access constructor
 * @classdesc Class for Managing Session Routes
 */
export class SessionRoutes {
    // Passport Authentication reference
    passport = new PassportService().passport
    // Express Router
    router = Router();
    // Session Class reference
    _session = new Session()

    constructor() {
        // Initialize SessionRoutes
        this._sessionRoutes()
    }

    // Set Passport Session
    session = {
        session: false
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