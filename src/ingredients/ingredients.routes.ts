import { Router } from 'express'
import {
    Ingredients,
} from '../'
import { PassportService } from "../session/passport";

/**
 * Definition for Ingredient Routes
 * @exports IngredientRoutes
 * @access constructor
 * @classdesc Class for Managing Ingredient Routes
 */
export class IngredientsRoutes {
    // Passport Authentication reference
    passport = new PassportService().passport
    // Express Router
    router = Router();
    // Ingredient Class reference
    _ingredients = new Ingredients()

    constructor() {
        // Initialize IngredientRoutes
        this._ingredientsRoutes()
    }

    // Set Passport Session
    session = {
        session: false
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