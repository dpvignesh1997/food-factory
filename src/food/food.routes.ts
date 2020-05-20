import { Router } from 'express'
import {
    Food,
} from '../'
import { PassportService } from "../session/passport";

/**
 * Definition for Food Routes
 * @exports FoodRoutes
 * @access constructor
 * @classdesc Class for Managing Food Routes
 */
export class FoodRoutes {
    // Passport Authentication reference
    passport = new PassportService().passport
    // Express Router
    router = Router();
    // Food Class reference
    _food = new Food()

    constructor() {
        // Initialize FoodRoutes
        this._foodRoutes()
    }

    // Set Passport Session
    session = {
        session: false
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