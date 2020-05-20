"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("..");
/**
 * Definition for OrderedFood Model
 * @exports OrderedFood
 * @access constructor
 * @classdesc Class for OrderedFood Schema - Creation & Access
 */
class OrderedFoodModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // Food Model Reference
        this.Food = new __1.FoodModel().getModel();
        // Orders Model Reference
        this.Orders = new __1.OrdersModel().getModel();
        // OrderedFood Schema definition
        this.orderedFoodSchema = new mongoose_1.Schema({
            order: { type: mongoose_1.Schema.Types.ObjectId, ref: this.Orders, required: true },
            food: { type: mongoose_1.Schema.Types.ObjectId, ref: this.Food, required: true },
            qty: { type: Number, required: true },
            created_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate OrderedFood Foreign key references
        // this.orderedFoodSchema.plugin(require('mongoose-autopopulate'))
    }
    /**
     * Get Mongoose Model for CRUD operation on OrderedFood
     * @constructs Model<orderedFoodInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<orderedFoodInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let OrderedFood = db.model('OrderedFood', this.orderedFoodSchema);
        return OrderedFood;
    }
}
exports.OrderedFoodModel = OrderedFoodModel;
//# sourceMappingURL=ordered-food.model.js.map