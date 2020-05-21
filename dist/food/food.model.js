"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("..");
const joi_1 = require("@hapi/joi");
/**
 * Definition for Food Model
 * @exports FoodModel
 * @access constructor
 * @classdesc Class for Food Schema - Creation & Access
 */
class FoodModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Food Schema definition
        this.foodSchema = new mongoose_1.Schema({
            name: { type: String, required: true, trim: true },
            code: { type: String, unique: true, required: true },
            cost_of_production: { type: Number, default: 0 },
            selling_cost: { type: Number, default: 0 },
            created_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            updated_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, autopopulate: true },
            status: { type: Number, enum: [foodStatus.ACTIVE, foodStatus.INACTIVE], default: foodStatus.ACTIVE },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate Food Foreign key references
        // this.foodSchema.plugin(require('mongoose-autopopulate'))
    }
    /**
     * Get Mongoose Model for CRUD operation on Food
     * @constructs Model<foodInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<foodInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Food = db.model('Food', this.foodSchema);
        return Food;
    }
}
exports.FoodModel = FoodModel;
/**
 * Enum for Food status
 * @constant {1, 2}
 * @default 1
 */
var foodStatus;
(function (foodStatus) {
    foodStatus[foodStatus["ACTIVE"] = 1] = "ACTIVE";
    foodStatus[foodStatus["INACTIVE"] = 2] = "INACTIVE";
})(foodStatus = exports.foodStatus || (exports.foodStatus = {}));
// Food Schema Validator
exports.FoodsSchemaValidator = joi_1.object({
    name: joi_1.string()
        .min(3)
        .max(30)
        .required(),
    code: joi_1.string()
        .min(1)
        .max(30)
        .required(),
    ingredients: joi_1.array()
        .min(1)
        .items(joi_1.object().keys({
        ingredient: joi_1.string()
            .required(),
        qty: joi_1.number()
            .min(1)
            .required()
    }))
        .required(),
    cost_of_production: joi_1.number()
        .min(0)
        .required(),
    selling_cost: joi_1.number()
        .min(0)
        .required()
});
//# sourceMappingURL=food.model.js.map