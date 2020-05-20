"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("..");
/**
 * Definition for FoodIngredients Model
 * @exports FoodIngredients
 * @access constructor
 * @classdesc Class for v Schema - Creation & Access
 */
class FoodIngredientsModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Food Model Reference
        this.Food = new __1.FoodModel().getModel();
        // Ingredients Model Reference
        this.Ingredients = new __1.IngredientsModel().getModel();
        // FoodIngredients Schema definition
        this.foodIngredientsSchema = new mongoose_1.Schema({
            food: { type: mongoose_1.Schema.Types.ObjectId, ref: this.Food, required: true },
            ingredient: { type: mongoose_1.Schema.Types.ObjectId, ref: this.Ingredients, required: true },
            qty: { type: Number, required: true },
            created_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            updated_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate FoodIngredients Foreign key references
        // this.foodIngredientsSchema.plugin(require('mongoose-autopopulate'))
    }
    /**
     * Get Mongoose Model for CRUD operation on FoodIngredients
     * @constructs Model<foodIngredientsInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<foodIngredientsInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let FoodIngredients = db.model('FoodIngredients', this.foodIngredientsSchema);
        return FoodIngredients;
    }
}
exports.FoodIngredientsModel = FoodIngredientsModel;
//# sourceMappingURL=food-ingredients.model.js.map