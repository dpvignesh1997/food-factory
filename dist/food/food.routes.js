"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("../");
const passport_1 = require("../session/passport");
/**
 * Definition for Food Routes
 * @exports FoodRoutes
 * @access constructor
 * @classdesc Class for Managing Food Routes
 */
class FoodRoutes {
    constructor() {
        // Passport Authentication reference
        this.passport = new passport_1.PassportService().passport;
        // Express Router
        this.router = express_1.Router();
        // Food Class reference
        this._food = new __1.Food();
        // Set Passport Session
        this.session = {
            session: false
        };
        // Initialize FoodRoutes
        this._foodRoutes();
    }
    // Create Food Routes
    _foodRoutes() {
        // Route for Create Food
        this.router.post('/', this.passport.authenticate('bearer', this.session), this._food.createFood);
        // Route for Get Food By Name
        this.router.get('/', this.passport.authenticate('bearer', this.session), this._food.getFoodByName);
        // Route for Get Food By Name
        this.router.get('/pc_gt_sc', this.passport.authenticate('bearer', this.session), this._food.getFoodCostOfProductionHigherThanSellingCost);
        // Route for Update Food Selling or Production Cost
        this.router.put('/', this.passport.authenticate('bearer', this.session), this._food.updateSellingOrProductionCost);
        // Route for Update Food Ingredients Qty
        this.router.put('/fi_qty', this.passport.authenticate('bearer', this.session), this._food.updateSellingOrProductionCost);
        // Route for Delete Food by Code
        this.router.delete('/', this.passport.authenticate('bearer', this.session), this._food.deleteFood);
    }
}
exports.FoodRoutes = FoodRoutes;
//# sourceMappingURL=food.routes.js.map