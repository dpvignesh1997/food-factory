"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("../..");
/**
 * Enum for Token status
 * @constant {1, 2, 3}
 * @default 1
 */
var tokenStatus;
(function (tokenStatus) {
    tokenStatus[tokenStatus["ACTIVE"] = 1] = "ACTIVE";
    tokenStatus[tokenStatus["LOGOUT"] = 2] = "LOGOUT";
    tokenStatus[tokenStatus["TERMINATED"] = 3] = "TERMINATED";
})(tokenStatus = exports.tokenStatus || (exports.tokenStatus = {}));
/**
 * Definition for Token Model
 * @exports TokenModel
 * @access constructor
 * @classdesc Class for Token Schema - Creation & Access
 */
class TokenModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Token Schema definition 
        this.tokenSchema = new mongoose_1.Schema({
            token: { type: String, unique: true, required: true, trim: true },
            details: { type: Object },
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            expiration: { type: Date, default: moment.utc().add(24, 'hours') },
            status: { type: Number, enum: [tokenStatus.ACTIVE, tokenStatus.LOGOUT, tokenStatus.TERMINATED], default: tokenStatus.ACTIVE },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate Token Foreign key references
        // this.tokenSchema.plugin(require('mongoose-autopopulate'))
    }
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
        let Token = db.model('Token', this.tokenSchema);
        return Token;
    }
}
exports.TokenModel = TokenModel;
//# sourceMappingURL=tokens.model.js.map