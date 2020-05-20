import { Router } from 'express'
import {
    Vendors,
} from '../'
import { PassportService } from "../session/passport";

/**
 * Definition for Vendor Routes
 * @exports VendorRoutes
 * @access constructor
 * @classdesc Class for Managing Vendor Routes
 */
export class VendorsRoutes {
    // Passport Authentication reference
    passport = new PassportService().passport
    // Express Router
    router = Router();
    // Vendor Class reference
    _vendors = new Vendors()

    constructor() {
        // Initialize VendorRoutes
        this._vendorsRoutes()
    }

    // Set Passport Session
    session = {
        session: false
    }

    // Create Vendor Routes
    _vendorsRoutes() {
        // Route for Create Vendor
        this.router.post('/', this.passport.authenticate('bearer', this.session), this._vendors.createVendor);
        // Route for Get Vendors By Id
        this.router.get('/', this.passport.authenticate('bearer', this.session), this._vendors.getVendorByNameOrCode);
        // Route for Get Vendors
        this.router.get('/status', this.passport.authenticate('bearer', this.session), this._vendors.getVendorByStatus);
        // Route for Update Vendor
        this.router.put('/', this.passport.authenticate('bearer', this.session), this._vendors.updateVendorByCode);
        // Route for Delete Vendor
        this.router.delete('/', this.passport.authenticate('bearer', this.session), this._vendors.deleteVendors);
    }
}