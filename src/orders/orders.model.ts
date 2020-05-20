import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    UserModel,
    userInterface,
} from "..";
import { object, string, number, array } from "@hapi/joi";


/**
 * Definition for Orders Model
 * @exports OrdersModel
 * @access constructor
 * @classdesc Class for Orders Schema - Creation & Access
 */
export class OrdersModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel()

    constructor() {
        // Auto Populate Orders Foreign key references
        // this.ordersSchema.plugin(require('mongoose-autopopulate'))
    }

    // Orders Schema definition
    ordersSchema: Schema = new Schema({
        user: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        order_total: { type: Number, default: 0 },
        status: {
            type: Number, enum: [
                OrderStatus.CANCELLED, OrderStatus.DELIVERED, OrderStatus.PENDING
            ], default: OrderStatus.PENDING
        },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on Orders
     * @constructs Model<ordersInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<ordersInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Orders: Model<ordersInterface> = db.model<ordersInterface>('Orders', this.ordersSchema);
        return Orders
    }
}

export enum OrderStatus {
    PENDING = 1,
    DELIVERED = 2,
    CANCELLED = 3
}

/**
 * Interface definition for Orders model
 * @extends Document (Mongoose)
 */
export interface ordersInterface extends Document {
    user: userInterface['_id'],
    order_total: number,
    status: OrderStatus,
    created_at: Date,
    updated_at: Date
}

export const OrdersSchemaValidator = object({
    food: array()
        .min(1)
        .items(
            object().keys({
                food: string()
                    .required(),
                qty: number()
                    .min(1)
                    .required()
            })
        )
        .required()
})