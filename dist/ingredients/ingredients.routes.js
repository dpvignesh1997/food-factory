"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const __1 = require("../");
const passport_1 = require("../session/passport");
/**
 * Definition for Ingredient Routes
 * @exports IngredientRoutes
 * @access constructor
 * @classdesc Class for Managing Ingredient Routes
 */
class IngredientsRoutes {
    constructor() {
        // Passport Authentication reference
        this.passport = new passport_1.PassportService().passport;
        // Express Router
        this.router = express_1.Router();
        // Ingredient Class reference
        this._ingredients = new __1.Ingredients();
        // Set Passport Session
        this.session = {
            session: false
        };
        // Initialize IngredientRoutes
        this._ingredientsRoutes();
    }
    // Create Ingredient Routes
    _ingredientsRoutes() {
        // Route for Create Vendor
        this.router.post('/', this.passport.authenticate('bearer', this.session), this._ingredients.createIngredient);
        // Route for Get Ingredients
        this.router.get('/byNameOrCode', this.passport.authenticate('bearer', this.session), this._ingredients.getIngredientByNameOrCode);
        // Route for Get Ingredients By Vendor
        this.router.get('/vendor', this.passport.authenticate('bearer', this.session), this._ingredients.getIngredientByVendor);
        // Route for Get Ingredients Available Qty Less than Threshold Qty 
        this.router.get('/avail_qty_lt_thres_qty', this.passport.authenticate('bearer', this.session), this._ingredients.getIngredientsLessThanThresholdQty);
        // Route for Update Ingredient
        this.router.put('/qty', this.passport.authenticate('bearer', this.session), this._ingredients.updateIngredientByCode);
        // Route for Delete Ingredient
        this.router.delete('/byCode', this.passport.authenticate('bearer', this.session), this._ingredients.deleteIngredients);
    }
}
exports.IngredientsRoutes = IngredientsRoutes;
//# sourceMappingURL=ingredients.routes.js.map