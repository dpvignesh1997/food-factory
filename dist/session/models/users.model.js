"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("../..");
const joi_1 = require("@hapi/joi");
// Default Avatar for User (Gravatar - CDN)
const avatar = 'https://vikasplus.com/wp-content/uploads/2016/04/Gravatar-icon.png';
/**
 * Definition for User Model
 * @exports UserModel
 * @access constructor
 * @classdesc Class for User Schema - Creation & Access
 */
class UserModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Schema Definition
        this.userSchema = new mongoose_1.Schema({
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
        });
        // Auto populate Referenced ObjectIds
        this.userSchema.plugin(require('mongoose-autopopulate'));
    }
    /**
     * Get Mongoose Model for CRUD operation on Users
     * @constructs Model<userInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<userInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let User = db.model('User', this.userSchema);
        return User;
    }
}
exports.UserModel = UserModel;
/**
 * Enum for User status
 * @constant {1, 2}
 * @default 1
 */
var userStatus;
(function (userStatus) {
    userStatus[userStatus["ACTIVE"] = 1] = "ACTIVE";
    userStatus[userStatus["DEACTIVATED"] = 2] = "DEACTIVATED";
})(userStatus = exports.userStatus || (exports.userStatus = {}));
exports.UserSchemaValidator = joi_1.object({
    first_name: joi_1.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    last_name: joi_1.string()
        .alphanum()
        .min(3)
        .max(30)
        .optional(),
    username: joi_1.string()
        .alphanum()
        .min(5)
        .max(30)
        .required(),
    email: joi_1.string()
        .email()
        .required(),
    password: joi_1.string()
        .min(8)
        .max(30)
        .required(),
    status: joi_1.number()
        .optional()
});
//# sourceMappingURL=users.model.js.map