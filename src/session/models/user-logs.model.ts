import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import {
    DataBase,
    UserModel,
    userInterface,
    TokenModel,
    tokenInterface
} from "../..";

/**
 * Interface definition for User Log model
 * @extends Document (Mongoose)
 */
export interface userLogInterface extends Document {
    type: string,
    req_url: string,
    req_method: string,
    status: userLogStatus,
    user: userInterface['_id'],
    token: tokenInterface['_id'],
    created_at: Date,
    updated_at: Date
}

/**
 * Enum for User Log status
 * @constant {1, 2}
 * @default 1
 */
export enum userLogStatus {
    SUCCESS = 1,
    FAILED = 2
}

export class UserLogModel {

    // MongoDB Connection Manager
    dataBase = new DataBase()

    // User Model Reference
    User: Model<userInterface> = new UserModel().getModel();

    // Token Model Reference
    Token: Model<tokenInterface> = new TokenModel().getModel();

    constructor() {
        // Auto populate Referenced ObjectIds
        // this.userLogSchema.plugin(require('mongoose-autopopulate'));
    }

    // user Log Schema Definition
    userLogSchema: Schema = new Schema({
        type: { type: String, required: true },
        req_url: { type: String, required: true },
        req_method: { type: String, required: true, enum: ['GET', 'PUT', 'POST', 'DELETE'] },
        status: { type: Number, enum: [userLogStatus.FAILED, userLogStatus.SUCCESS], default: userLogStatus.SUCCESS },
        user: { type: Schema.Types.ObjectId, ref: this.User, autopopulate: true },
        token: { type: Schema.Types.ObjectId, ref: this.Token, autopopulate: true },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on User Logs
     * @constructs Model<userLogInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<userLogInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let UserLog: Model<userLogInterface> = db.model<userLogInterface>('UserLog', this.userLogSchema);
        return UserLog
    }
}