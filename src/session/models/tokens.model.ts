import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import { DataBase, UserModel, userInterface } from "../..";

/**
 * Interface definition for Token model
 * @extends Document (Mongoose)
 */
export interface tokenInterface extends Document {
    token: string,
    details: Object,
    user: userInterface['_id'],
    expiration: Date,
    status: tokenStatus,
    created_at: Date,
    updated_at: Date
}

/**
 * Enum for Token status
 * @constant {1, 2, 3}
 * @default 1
 */
export enum tokenStatus {
    ACTIVE = 1,
    LOGOUT = 2,
    TERMINATED = 3
}

/**
 * Definition for Token Model
 * @exports TokenModel
 * @access constructor
 * @classdesc Class for Token Schema - Creation & Access
 */
export class TokenModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel()

    constructor() {
        // Auto Populate Token Foreign key references
        // this.tokenSchema.plugin(require('mongoose-autopopulate'))
    }

    // Token Schema definition 
    tokenSchema: Schema = new Schema({
        token: { type: String, unique: true, required: true, trim: true },
        details: { type: Object },
        user: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        expiration: { type: Date, default: moment.utc().add(24, 'hours') },
        status: { type: Number, enum: [tokenStatus.ACTIVE, tokenStatus.LOGOUT, tokenStatus.TERMINATED], default: tokenStatus.ACTIVE },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on User Logs
     * @constructs Model<tokenInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<tokenInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Token: Model<tokenInterface> = db.model<tokenInterface>('Token', this.tokenSchema);
        return Token
    }
}