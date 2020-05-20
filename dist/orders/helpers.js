"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const mongodb_1 = require("mongodb");
class OrdersHelper {
    constructor() {
        // Ingredients Model reference
        this.Ingredients = new __1.IngredientsModel().getModel();
        // Food Model reference
        this.Food = new __1.FoodModel().getModel();
        // FoodIngredients Model reference
        this.FoodIngredients = new __1.FoodIngredientsModel().getModel();
    }
    isSufficientIngredientsAvailable(food) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let requiredIngredientsQty = {};
            let shortageIngredients = {};
            let orderedFood = [];
            let order_total = 0;
            for (let _food of food) {
                let exisitingFood = yield this.Food.findOne({ code: _food['food'] }).exec();
                if (!exisitingFood) {
                    reject({ message: __1.FoodMessages.NO_FOOD_WITH_CODE_EXIST });
                    break;
                }
                orderedFood.push({
                    food: exisitingFood._id,
                    qty: _food['qty']
                });
                let _foodIngredients = yield this.FoodIngredients.find({ food: exisitingFood._id }).exec();
                if (_foodIngredients.length === 0) {
                    reject({ message: __1.FoodMessages.NO_FOOD_WITH_CODE_EXIST });
                    break;
                }
                for (let _fi of _foodIngredients) {
                    requiredIngredientsQty[_fi.ingredient] = requiredIngredientsQty[_fi.ingredient] || 0;
                    requiredIngredientsQty[_fi.ingredient] += _food['qty'];
                }
                order_total += exisitingFood.selling_cost * _food['qty'];
            }
            for (let key of Object.keys(requiredIngredientsQty)) {
                let availableIngredient = yield this.Ingredients.findOne({ _id: new mongodb_1.ObjectID(key) }).exec();
                if (!availableIngredient) {
                    reject({ message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST });
                    break;
                }
                if (availableIngredient.available_qty < requiredIngredientsQty[key]) {
                    shortageIngredients[availableIngredient.code] = requiredIngredientsQty[key] - availableIngredient.available_qty;
                    reject({ shortageIngredients, message: __1.OrderMessages.NO_SUFFICIENT_INGREDIENTS_AVAILABLE });
                    break;
                }
            }
            resolve({ order_total, requiredIngredientsQty, orderedFood });
        }));
    }
    placeOrder(requiredIngredientsQty) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                for (let key of Object.keys(requiredIngredientsQty)) {
                    let _ingredient = yield this.Ingredients.findOne({ _id: new mongodb_1.ObjectID(key) }).exec();
                    if (_ingredient) {
                        _ingredient.available_qty = _ingredient.available_qty - requiredIngredientsQty[key];
                        yield _ingredient.save();
                    }
                }
                resolve(true);
            }
            catch (error) {
                reject(error);
            }
        }));
    }
}
exports.OrdersHelper = OrdersHelper;
//# sourceMappingURL=helpers.js.map