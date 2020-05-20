"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moment = require("moment");
const __1 = require("../..");
const joi_1 = require("@hapi/joi");
/**
 * Definition for Ingredients Model
 * @exports IngredientsModel
 * @access constructor
 * @classdesc Class for Ingredients Schema - Creation & Access
 */
class IngredientsModel {
    constructor() {
        // MongoDB Connection Manager
        this.dataBase = new __1.DataBase();
        // User Model Reference
        this.User = new __1.UserModel().getModel();
        // Vendor Model Reference
        this.Vendor = new __1.VendorsModel().getModel();
        // Ingredient Schema definition
        this.ingredientSchema = new mongoose_1.Schema({
            name: { type: String, required: true, trim: true },
            code: { type: String, unique: true, required: true },
            available_qty: { type: Number, default: 0 },
            threshold_qty: { type: Number, default: 0 },
            vendor: { type: mongoose_1.Schema.Types.ObjectId, ref: this.Vendor, required: true, autopopulate: true },
            created_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, required: true, autopopulate: true },
            updated_by: { type: mongoose_1.Schema.Types.ObjectId, ref: this.User, required: true, autopopulate: true },
            created_at: { type: Date, default: moment.utc() },
            updated_at: { type: Date, default: moment.utc() },
        });
        // Auto Populate Ingredient Foreign key references
        // this.ingredientSchema.plugin(require('mongoose-autopopulate'))
    }
    /**
     * Get Mongoose Model for CRUD operation on Ingredients
     * @constructs Model<ingredientsInterface>
     * @argument DEFAULT_DB_NAME
     * @return {Model<ingredientsInterface>}
     */
    getModel() {
        // Get Database Connection Instance
        let db = this.dataBase.getConnection(process.env['DEFAULT_DB_NAME']);
        // Register Schema
        let Ingredient = db.model('Ingredient', this.ingredientSchema);
        return Ingredient;
    }
}
exports.IngredientsModel = IngredientsModel;
exports.IngredientsSchemaValidator = joi_1.object({
    name: joi_1.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    code: joi_1.string()
        .alphanum()
        .min(1)
        .max(30)
        .required(),
    available_qty: joi_1.number()
        .min(1)
        .required(),
    threshold_qty: joi_1.number()
        .min(1)
        .required(),
    vendor: joi_1.string()
        .alphanum()
        .meta({ type: mongoose_1.Schema.Types.ObjectId })
        .required()
});
//# sourceMappingURL=ingredients.model.js.map