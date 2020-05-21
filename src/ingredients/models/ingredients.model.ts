import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    UserModel,
    userInterface,
    VendorsModel,
    vendorsInterface,
} from "../..";
import { object, string, number } from "@hapi/joi";

/**
 * Definition for Ingredients Model
 * @exports IngredientsModel
 * @access constructor
 * @classdesc Class for Ingredients Schema - Creation & Access
 */
export class IngredientsModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel()
    // Vendor Model Reference
    Vendor: Model<vendorsInterface> = new VendorsModel().getModel()

    constructor() {
        // Auto Populate Ingredient Foreign key references
        // this.ingredientSchema.plugin(require('mongoose-autopopulate'))
    }

    // Ingredient Schema definition
    ingredientSchema: Schema = new Schema({
        name: { type: String, required: true, trim: true },
        code: { type: String, unique: true, required: true },
        available_qty: { type: Number, default: 0 },
        threshold_qty: { type: Number, default: 0 },
        vendor: { type: Schema.Types.ObjectId, ref: this.Vendor, required: true, autopopulate: true },
        created_by: { type: Schema.Types.ObjectId, ref: this.User, required: true, autopopulate: true },
        updated_by: { type: Schema.Types.ObjectId, ref: this.User, required: true, autopopulate: true },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on Ingredients
     * @constructs Model<ingredientsInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<ingredientsInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Ingredient: Model<ingredientsInterface> = db.model<ingredientsInterface>('Ingredient', this.ingredientSchema);
        return Ingredient
    }
}


/**
 * Interface definition for Ingredient model
 * @extends Document (Mongoose)
 */
export interface ingredientsInterface extends Document {
    name: string,
    code: string,
    available_qty: number,
    threshold_qty: number,
    vendor: vendorsInterface['_id'],
    created_by: userInterface['_id'],
    updated_by: userInterface['_id'],
    expiration: Date,
    created_at: Date,
    updated_at: Date
}

// Joi Validator for Ingredients Schema
export const IngredientsSchemaValidator = object({
    name: string()
        .min(3)
        .max(30)
        .required(),
    code: string()
        .min(1)
        .max(30)
        .required(),
    available_qty: number()
        .min(1)
        .required(),
    threshold_qty: number()
        .min(1)
        .required(),
    vendor: string()
        .alphanum()
        .meta({ type: Schema.Types.ObjectId })
        .required()
})