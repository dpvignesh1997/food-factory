"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("..");
const joi_1 = require("@hapi/joi");
/**
 * Definition for Orders Model
 * @exports OrdersModel
 * @access constructor
 * @classdesc Class for Orders Schema - Creation & Access
 */
class OrdersModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Orders Schema definition
        this.ordersSchema = new mongoose_1.Schema({
            user: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            order_total: { type: Number, default: 0 },
            status: {
                type: Number, enum: [
                    OrderStatus.CANCELLED, OrderStatus.DELIVERED, OrderStatus.PENDING
                ], default: OrderStatus.PENDING
            },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate Orders Foreign key references
        // this.ordersSchema.plugin(require('mongoose-autopopulate'))
    }
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
        let Orders = db.model('Orders', this.ordersSchema);
        return Orders;
    }
}
exports.OrdersModel = OrdersModel;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus[OrderStatus["PENDING"] = 1] = "PENDING";
    OrderStatus[OrderStatus["DELIVERED"] = 2] = "DELIVERED";
    OrderStatus[OrderStatus["CANCELLED"] = 3] = "CANCELLED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
exports.OrdersSchemaValidator = joi_1.object({
    food: joi_1.array()
        .min(1)
        .items(joi_1.object().keys({
        food: joi_1.string()
            .required(),
        qty: joi_1.number()
            .min(1)
            .required()
    }))
        .required()
});
//# sourceMappingURL=orders.model.js.map