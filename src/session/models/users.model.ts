import { Schema, Model, Document } from 'mongoose';
import * as moment from 'moment'
import { DataBase } from "../..";
import { object, string, number } from "@hapi/joi";

// Default Avatar for User (Gravatar - CDN)
const avatar = 'https://vikasplus.com/wp-content/uploads/2016/04/Gravatar-icon.png';

/**
 * Definition for User Model
 * @exports UserModel
 * @access constructor
 * @classdesc Class for User Schema - Creation & Access
 */
export class UserModel {
    // MongoDB Connection Manager
    dataBase = new DataBase()

    constructor() {
        // Auto populate Referenced ObjectIds
        this.userSchema.plugin(require('mongoose-autopopulate'))
    }

    // User Schema Definition
    userSchema: Schema = new Schema({
        first_name: { type: String, required: true },
        last_name: { type: String, default: '' },
        username: { type: String, unique: true, required: true, trim: true },
        email: { type: String, unique: true, required: true, trim: true },
        password: { type: String, required: true, select: false },
        avatar: { type: String, default: avatar },
        status: { type: Number, enum: [userStatus.ACTIVE, userStatus.DEACTIVATED], default: userStatus.ACTIVE, select: false },
        password_reset_token: { type: String, select: false },
        password_reset_token_expiration: { type: Date, select: false },
        created_at: { type: Date, default: moment.utc() },
        updated_at: { type: Date, default: moment.utc() },
    })

    /**
     * Get Mongoose Model for CRUD operation on Users
     * @constructs Model<userInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<userInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME'])
        // Register Schema
        let User: Model<userInterface> = db.model<userInterface>('User', this.userSchema)
        return User
    }
}

/**
 * Interface definition for User model
 * @extends Document (Mongoose)
 */
export interface userInterface extends Document {
    first_name: string,
    last_name: string,
    username: string,
    email: string,
    password: string,
    avatar: string,
    status: userStatus,
    password_reset_token: string,
    password_reset_token_expiration: Date,
    created_at: Date,
    updated_at: Date
}

/**
 * Enum for User status
 * @constant {1, 2}
 * @default 1
 */
export enum userStatus {
    ACTIVE = 1,
    DEACTIVATED = 2
}

export const UserSchemaValidator = object({
    first_name: string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    last_name: string()
        .alphanum()
        .min(3)
        .max(30)
        .optional(),
    username: string()
        .alphanum()
        .min(5)
        .max(30)
        .required(),
    email: string()
        .email()
        .required(),
    password: string()
        .min(8)
        .max(30)
        .required(),
    status: number()
        .optional()
})