"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("../");
const passport_1 = require("../session/passport");
/**
 * Definition for Order Routes
 * @exports OrderRoutes
 * @access constructor
 * @classdesc Class for Managing Order Routes
 */
class OrderRoutes {
    constructor() {
        // Passport Authentication reference
        this.passport = new passport_1.PassportService().passport;
        // Express Router
        this.router = express_1.Router();
        // Order Class reference
        this._order = new __1.Order();
        // Set Passport Session
        this.session = {
            session: false
        };
        // Initialize OrderRoutes
        this._orderRoutes();
    }
    // Create Order Routes
    _orderRoutes() {
        // Route for Place Order
        this.router.post('/', this.passport.authenticate('bearer', this.session), this._order.placeOrder);
        // Route for Get Orders of User
        this.router.get('/byUser', this.passport.authenticate('bearer', this.session), this._order.getOrdersOfUser);
        // Route for cancel Order
        this.router.put('/byID', this.passport.authenticate('bearer', this.session), this._order.cancelOrder);
    }
}
exports.OrderRoutes = OrderRoutes;
//# sourceMappingURL=orders.routes.js.map