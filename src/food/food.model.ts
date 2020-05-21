import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    UserModel,
    userInterface,
} from "..";
import { object, string, number, array } from "@hapi/joi";


/**
 * Definition for Food Model
 * @exports FoodModel
 * @access constructor
 * @classdesc Class for Food Schema - Creation & Access
 */
export class FoodModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel()

    constructor() {
        // Auto Populate Food Foreign key references
        // this.foodSchema.plugin(require('mongoose-autopopulate'))
    }

    // Food Schema definition
    foodSchema: Schema = new Schema({
        name: { type: String, required: true, trim: true },
        code: { type: String, unique: true, required: true },
        cost_of_production: { type: Number, default: 0 },
        selling_cost: { type: Number, default: 0 },
        created_by: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        updated_by: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        status: { type: Number, enum: [foodStatus.ACTIVE, foodStatus.INACTIVE], default: foodStatus.ACTIVE },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on Food
     * @constructs Model<foodInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<foodInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Food: Model<foodInterface> = db.model<foodInterface>('Food', this.foodSchema);
        return Food
    }
}

/**
 * Enum for Food status
 * @constant {1, 2}
 * @default 1
 */
export enum foodStatus {
    ACTIVE = 1,
    INACTIVE = 2
}

/**
 * Interface definition for Food model
 * @extends Document (Mongoose)
 */
export interface foodInterface extends Document {
    name: string,
    code: string,
    cost_of_production: number,
    selling_cost: number,
    created_by: userInterface['_id'],
    updated_by: userInterface['_id'],
    created_at: Date,
    updated_at: Date
}

// Food Schema Validator
export const FoodsSchemaValidator = object({
    name: string()
        .min(3)
        .max(30)
        .required(),
    code: string()
        .min(1)
        .max(30)
        .required(),
    ingredients: array()
        .min(1)
        .items(
            object().keys({
                ingredient: string()
                    .required(),
                qty: number()
                    .min(1)
                    .required()
            })
        )
        .required(),
    cost_of_production: number()
        .min(0)
        .required(),
    selling_cost: number()
        .min(0)
        .required()
})