"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("../..");
/**
 * Enum for User Log status
 * @constant {1, 2}
 * @default 1
 */
var userLogStatus;
(function (userLogStatus) {
    userLogStatus[userLogStatus["SUCCESS"] = 1] = "SUCCESS";
    userLogStatus[userLogStatus["FAILED"] = 2] = "FAILED";
})(userLogStatus = exports.userLogStatus || (exports.userLogStatus = {}));
class UserLogModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Token Model Reference
        this.Token = new __1.TokenModel().getModel();
        // user Log Schema Definition
        this.userLogSchema = new mongoose_1.Schema({
            type: { type: String, required: true },
            req_url: { type: String, required: true },
            req_method: { type: String, required: true, enum: ['GET', 'PUT', 'POST', 'DELETE'] },
            status: { type: Number, enum: [userLogStatus.FAILED, userLogStatus.SUCCESS], default: userLogStatus.SUCCESS },
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            token: { type: mongoose_1.Schema.Types.ObjectId, ref: this.Token, autopopulate: true },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto populate Referenced ObjectIds
        // this.userLogSchema.plugin(require('mongoose-autopopulate'));
    }
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
        let UserLog = db.model('UserLog', this.userLogSchema);
        return UserLog;
    }
}
exports.UserLogModel = UserLogModel;
//# sourceMappingURL=user-logs.model.js.map