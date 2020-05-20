import { Router } from 'express'
import {
    Order,
} from '../'
import { PassportService } from "../session/passport";

/**
 * Definition for Order Routes
 * @exports OrderRoutes
 * @access constructor
 * @classdesc Class for Managing Order Routes
 */
export class OrderRoutes {
    // Passport Authentication reference
    passport = new PassportService().passport
    // Express Router
    router = Router();
    // Order Class reference
    _order = new Order()

    constructor() {
        // Initialize OrderRoutes
        this._orderRoutes()
    }

    // Set Passport Session
    session = {
        session: false
    }

    // Create Order Routes
    _orderRoutes() {
        // Route for Place Order
        this.router.post('/', this.passport.authenticate('bearer', this.session), this._order.placeOrder);
        // Route for Get Orders of User
        this.router.get('/', this.passport.authenticate('bearer', this.session), this._order.getOrdersOfUser);
        // Route for cancel Order
        this.router.put('/', this.passport.authenticate('bearer', this.session), this._order.cancelOrder);
    }
}