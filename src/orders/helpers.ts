import { Model, Document } from "mongoose";
import {
    IngredientsModel,
    ingredientsInterface,
    IngredientMessages,
    FoodModel,
    foodInterface,
    FoodMessages,
    FoodIngredientsModel,
    foodIngredientsInterface,
    OrderMessages
} from "..";
import { ObjectID } from "mongodb";

export class OrdersHelper {

    // Ingredients Model reference
    Ingredients: Model<ingredientsInterface> = new IngredientsModel().getModel();
    // Food Model reference
    Food: Model<foodInterface> = new FoodModel().getModel();
    // FoodIngredients Model reference
    FoodIngredients: Model<foodIngredientsInterface> = new FoodIngredientsModel().getModel();

    constructor() { }

    isSufficientIngredientsAvailable(food: Array<any>) {
        return new Promise(async (resolve, reject) => {
            let requiredIngredientsQty = {}
            let shortageIngredients = {}
            let orderedFood = [];
            let order_total = 0;
            for (let _food of food) {
                let exisitingFood = await this.Food.findOne({ code: _food['food'] }).exec();
                if (!exisitingFood) {
                    reject({ message: FoodMessages.NO_FOOD_WITH_CODE_EXIST })
                    break;
                }

                orderedFood.push({
                    food: exisitingFood._id,
                    qty: _food['qty']
                })
                let _foodIngredients = await this.FoodIngredients.find({ food: exisitingFood._id }).exec();
                if (_foodIngredients.length === 0) {
                    reject({ message: FoodMessages.NO_FOOD_WITH_CODE_EXIST })
                    break;
                }
                for (let _fi of _foodIngredients) {
                    requiredIngredientsQty[_fi.ingredient] = requiredIngredientsQty[_fi.ingredient] || 0;
                    requiredIngredientsQty[_fi.ingredient] += _food['qty'];
                }

                order_total += exisitingFood.selling_cost * _food['qty'];
            }

            for (let key of Object.keys(requiredIngredientsQty)) {
                let availableIngredient = await this.Ingredients.findOne({ _id: new ObjectID(key) }).exec();
                if (!availableIngredient) {
                    reject({ message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST });
                    break;
                }

                if (availableIngredient.available_qty < requiredIngredientsQty[key]) {
                    shortageIngredients[availableIngredient.code] = requiredIngredientsQty[key] - availableIngredient.available_qty;
                    reject({ shortageIngredients, message: OrderMessages.NO_SUFFICIENT_INGREDIENTS_AVAILABLE })
                    break;
                }
            }

            resolve({ order_total, requiredIngredientsQty, orderedFood });
        })
    }

    placeOrder(requiredIngredientsQty: Object) {
        return new Promise(async (resolve, reject) => {
            try {
                for (let key of Object.keys(requiredIngredientsQty)) {
                    let _ingredient = await this.Ingredients.findOne({ _id: new ObjectID(key) }).exec();
                    if (_ingredient) {
                        _ingredient.available_qty = _ingredient.available_qty - requiredIngredientsQty[key];
                        await _ingredient.save()
                    }
                }

                resolve(true)
            } catch (error) {
                reject(error)
            }
        })
    }
}