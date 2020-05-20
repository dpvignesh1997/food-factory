import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    UserModel,
    userInterface,
    IngredientsModel,
    ingredientsInterface,
    FoodModel,
    foodInterface
} from "..";

/**
 * Definition for FoodIngredients Model
 * @exports FoodIngredients
 * @access constructor
 * @classdesc Class for v Schema - Creation & Access
 */
export class FoodIngredientsModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel()
    // Food Model Reference
    Food: Model<foodInterface> = new FoodModel().getModel()
    // Ingredients Model Reference
    Ingredients: Model<ingredientsInterface> = new IngredientsModel().getModel()

    constructor() {
        // Auto Populate FoodIngredients Foreign key references
        // this.foodIngredientsSchema.plugin(require('mongoose-autopopulate'))
    }

    // FoodIngredients Schema definition
    foodIngredientsSchema: Schema = new Schema({
        food: { type: Schema.Types.ObjectId, ref: this.Food, required: true },
        ingredient: { type: Schema.Types.ObjectId, ref: this.Ingredients, required: true },
        qty: { type: Number, required: true },
        created_by: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        updated_by: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

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
        let FoodIngredients: Model<foodIngredientsInterface> = db.model<foodIngredientsInterface>('FoodIngredients', this.foodIngredientsSchema);
        return FoodIngredients
    }
}

/**
 * Interface definition for FoodIngredients model
 * @extends Document (Mongoose)
 */
export interface foodIngredientsInterface extends Document {
    food: foodInterface['_id'],
    ingredient: ingredientsInterface['_id'],
    qty: number,
    created_by: userInterface['_id'],
    updated_by: userInterface['_id'],
    created_at: Date,
    updated_at: Date
}