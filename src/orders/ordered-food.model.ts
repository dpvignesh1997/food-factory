import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    FoodModel,
    foodInterface,
    OrdersModel,
    ordersInterface
} from "..";

/**
 * Definition for OrderedFood Model
 * @exports OrderedFood
 * @access constructor
 * @classdesc Class for OrderedFood Schema - Creation & Access
 */
export class OrderedFoodModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // Food Model Reference
    Food: Model<foodInterface> = new FoodModel().getModel()
    // Orders Model Reference
    Orders: Model<ordersInterface> = new OrdersModel().getModel()

    constructor() {
        // Auto Populate OrderedFood Foreign key references
        // this.orderedFoodSchema.plugin(require('mongoose-autopopulate'))
    }

    // OrderedFood Schema definition
    orderedFoodSchema: Schema = new Schema({
        order: { type: Schema.Types.ObjectId, ref: this.Orders, required: true },
        food: { type: Schema.Types.ObjectId, ref: this.Food, required: true },
        qty: { type: Number, required: true },
        created_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on OrderedFood
     * @constructs Model<orderedFoodInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<orderedFoodInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let OrderedFood: Model<orderedFoodInterface> = db.model<orderedFoodInterface>('OrderedFood', this.orderedFoodSchema);
        return OrderedFood
    }
}

/**
 * Interface definition for OrderedFood model
 * @extends Document (Mongoose)
 */
export interface orderedFoodInterface extends Document {
    order: ordersInterface['_id'],
    food: foodInterface['_id'],
    qty: number,
    created_at: Date
}