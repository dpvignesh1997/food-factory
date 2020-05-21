import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    UserModel,
    userInterface
} from "../..";
import { object, string } from "@hapi/joi";

/**
 * Definition for Vendor Model
 * @exports VendorsModel
 * @access constructor
 * @classdesc Class for Vendors Schema - Creation & Access
 */
export class VendorsModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel()

    constructor() {
        // Auto Populate Vendor Foreign key references
        // this.vendorSchema.plugin(require('mongoose-autopopulate'))
    }

    // Vendor Schema definition
    vendorSchema: Schema = new Schema({
        name: { type: String, required: true, trim: true },
        code: { type: String, unique: true, required: true },
        contact: { type: String, default: null },
        status: { type: Number, enum: [vendorStatus.ACTIVE, vendorStatus.DISCONTINUED], default: vendorStatus.ACTIVE },
        created_by: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        updated_by: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on Vendors
     * @constructs Model<vendorsInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<vendorsInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Vendor: Model<vendorsInterface> = db.model<vendorsInterface>('Vendor', this.vendorSchema);
        return Vendor
    }
}

/**
 * Enum for Vendor status
 * @constant {1, 2}
 * @default 1
 */
export enum vendorStatus {
    ACTIVE = 1,
    DISCONTINUED = 2
}

/**
 * Interface definition for Vendor model
 * @extends Document (Mongoose)
 */
export interface vendorsInterface extends Document {
    name: string,
    code: string,
    contact: number,
    created_by: userInterface['_id'],
    updated_by: userInterface['_id'],
    created_at: Date,
    updated_at: Date
}

// Joi Validator for Vendor Schema
export const VendorSchemaValidator = object({
    name: string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    code: string()
        .min(1)
        .max(30)
        .required(),
    contact: string()
        .min(10)
        .max(10)
        .required()
})