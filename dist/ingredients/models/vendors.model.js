"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("../..");
const joi_1 = require("@hapi/joi");
/**
 * Definition for Vendor Model
 * @exports VendorsModel
 * @access constructor
 * @classdesc Class for Vendors Schema - Creation & Access
 */
class VendorsModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Vendor Schema definition
        this.vendorSchema = new mongoose_1.Schema({
            name: { type: String, required: true, trim: true },
            code: { type: String, unique: true, required: true },
            contact: { type: String, default: null },
            status: { type: Number, enum: [vendorStatus.ACTIVE, vendorStatus.DISCONTINUED], default: vendorStatus.ACTIVE },
            created_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            updated_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate Vendor Foreign key references
        // this.vendorSchema.plugin(require('mongoose-autopopulate'))
    }
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
        let Vendor = db.model('Vendor', this.vendorSchema);
        return Vendor;
    }
}
exports.VendorsModel = VendorsModel;
var vendorStatus;
(function (vendorStatus) {
    vendorStatus[vendorStatus["ACTIVE"] = 1] = "ACTIVE";
    vendorStatus[vendorStatus["DISCONTINUED"] = 2] = "DISCONTINUED";
})(vendorStatus = exports.vendorStatus || (exports.vendorStatus = {}));
exports.VendorSchemaValidator = joi_1.object({
    name: joi_1.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    code: joi_1.string()
        .min(1)
        .max(30)
        .required(),
    contact: joi_1.string()
        .min(10)
        .max(10)
        .required()
});
//# sourceMappingURL=vendors.model.js.map