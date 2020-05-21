"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("../");
const passport_1 = require("../session/passport");
/**
 * Definition for Vendor Routes
 * @exports VendorRoutes
 * @access constructor
 * @classdesc Class for Managing Vendor Routes
 */
class VendorsRoutes {
    constructor() {
        // Passport Authentication reference
        this.passport = new passport_1.PassportService().passport;
        // Express Router
        this.router = express_1.Router();
        // Vendor Class reference
        this._vendors = new __1.Vendors();
        // Set Passport Session
        this.session = {
            session: false
        };
        // Initialize VendorRoutes
        this._vendorsRoutes();
    }
    // Create Vendor Routes
    _vendorsRoutes() {
        // Route for Create Vendor
        this.router.post('/', this.passport.authenticate('bearer', this.session), this._vendors.createVendor);
        // Route for Get Vendors By Id
        this.router.get('/byNameOrCode', this.passport.authenticate('bearer', this.session), this._vendors.getVendorByNameOrCode);
        // Route for Get Vendors
        this.router.get('/byStatus', this.passport.authenticate('bearer', this.session), this._vendors.getVendorByStatus);
        // Route for Update Vendor
        this.router.put('/contactOrStatus', this.passport.authenticate('bearer', this.session), this._vendors.updateVendorByCode);
        // Route for Delete Vendor
        this.router.delete('/byCode', this.passport.authenticate('bearer', this.session), this._vendors.deleteVendors);
    }
}
exports.VendorsRoutes = VendorsRoutes;
//# sourceMappingURL=vendors.routes.js.map