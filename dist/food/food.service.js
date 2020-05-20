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
const moment = require("moment");
/**
 * Definition for Food management
 * @exports Food
 * @access constructor
 * @classdesc class for Food CRUD
 */
class Food {
    constructor() {
        // User Model reference
        this.User = new __1.UserModel().getModel();
        // User Log Model reference
        this.UserLog = new __1.UserLogModel().getModel();
        // Ingredients Model reference
        this.Ingredients = new __1.IngredientsModel().getModel();
        // Food Model reference
        this.Food = new __1.FoodModel().getModel();
        // FoodIngredientsModel Model reference
        this.FoodIngredients = new __1.FoodIngredientsModel().getModel();
        this.createFood = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { name, code, ingredients, cost_of_production, selling_cost, created_by } = req.body;
            try {
                yield __1.FoodsSchemaValidator.validateAsync({
                    name,
                    code,
                    ingredients,
                    cost_of_production,
                    selling_cost
                });
                this.Food.findOne({ code }).exec((err, existingFood) => __awaiter(this, void 0, void 0, function* () {
                    /**
                     * If error in fetching User
                     * @return {Response}
                     * @status {INTERNAL SERVER ERROR} 500
                     * @message Internal Server Error!
                     * @responsetype {JSON}
                     */
                    if (err) {
                        console.error(err);
                        res.status(500).json({
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    if (existingFood) {
                        res.status(405).json({
                            message: __1.FoodMessages.FOOD_WITH_CODE_EXIST,
                            food: existingFood
                        });
                        return;
                    }
                    let _food = new this.Food({
                        name,
                        code,
                        cost_of_production,
                        selling_cost,
                        created_by,
                        updated_by: created_by
                    });
                    let _ingredientsForFood = [];
                    for (let _ingredient of ingredients) {
                        let ingredient = yield this.Ingredients.findOne({ code: _ingredient['ingredient'] }).exec();
                        if (!ingredient) {
                            res.status(405).json({
                                message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                            });
                            return;
                        }
                        _ingredientsForFood.push({
                            ingredient: ingredient._id,
                            qty: _ingredient['qty'],
                            created_by,
                            updated_by: created_by,
                            created_at: moment.utc().toDate(),
                            updated_at: moment.utc().toDate()
                        });
                    }
                    _food.save((err, savedFood) => __awaiter(this, void 0, void 0, function* () {
                        /**
                         * If error in fetching User
                         * @return {Response}
                         * @status {INTERNAL SERVER ERROR} 500
                         * @message Internal Server Error!
                         * @responsetype {JSON}
                         */
                        if (err) {
                            console.error(err);
                            res.status(500).json({
                                message: __1.Messages.INTERNAL_SERVER_ERROR
                            });
                            return;
                        }
                        yield (new this.UserLog({
                            type: 'food',
                            req_url: req.url,
                            req_method: req.method,
                            status: __1.userLogStatus.SUCCESS,
                            user: created_by
                        })).save();
                        yield this.FoodIngredients.collection.insertMany(_ingredientsForFood.map(ig => (Object.assign({ food: savedFood._id }, ig))));
                        res.json({
                            message: __1.FoodMessages.CREATED,
                            food: savedFood
                        });
                    }));
                }));
            }
            catch (error) {
                console.error(error);
                res.status(400).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
        });
        this.getFoodByName = (req, res, next) => {
            let { name } = req.query;
            if (!name) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Food.findOne({ name })
                .populate('created_by')
                .populate('updated_by')
                .exec((err, food) => {
                /**
                 * If error in fetching User
                 * @return {Response}
                 * @status {INTERNAL SERVER ERROR} 500
                 * @message Internal Server Error!
                 * @responsetype {JSON}
                 */
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (!food) {
                    res.status(400).json({
                        message: __1.FoodMessages.NO_FOOD_WITH_NAME_EXIST
                    });
                    return;
                }
                res.json(food);
            });
        };
        this.getFoodCostOfProductionHigherThanSellingCost = (req, res, next) => {
            this.Food.find({ $where: "this.cost_of_production > this.selling_cost" }).exec((err, food) => {
                /**
                 * If error in fetching User
                 * @return {Response}
                 * @status {INTERNAL SERVER ERROR} 500
                 * @message Internal Server Error!
                 * @responsetype {JSON}
                 */
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (food.length === 0) {
                    res.json({
                        message: __1.FoodMessages
                    });
                }
                res.json(food);
            });
        };
        this.updateSellingOrProductionCost = (req, res, next) => {
            let { food, cost_of_production, selling_cost } = req.body;
            let $set = {};
            if (cost_of_production)
                $set['cost_of_production'] = cost_of_production;
            if (selling_cost)
                $set['selling_cost'] = selling_cost;
            if (!food || $set === {}) {
                res.status(400).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Food.findOne({ code: food }).exec((err, existingFood) => {
                /**
                 * If error in fetching User
                 * @return {Response}
                 * @status {INTERNAL SERVER ERROR} 500
                 * @message Internal Server Error!
                 * @responsetype {JSON}
                 */
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (!existingFood) {
                    res.status(405).json({
                        message: __1.FoodMessages.NO_FOOD_WITH_CODE_EXIST
                    });
                    return;
                }
                this.Food.updateOne({ _id: existingFood._id }, { $set }).exec((err, updateResult) => {
                    /**
                         * If error in fetching User
                         * @return {Response}
                         * @status {INTERNAL SERVER ERROR} 500
                         * @message Internal Server Error!
                         * @responsetype {JSON}
                         */
                    if (err) {
                        console.error(err);
                        res.status(500).json({
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    res.json({
                        message: __1.FoodMessages.UPDATE_ONE
                    });
                });
            });
        };
        this.updateIngredeintsOnFood = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { food, ingredient, qty, created_by } = req.body;
            if (!food) {
                res.status(400).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Food.findOne({ code: food }).exec((err, existingFood) => {
                /**
                 * If error in fetching User
                 * @return {Response}
                 * @status {INTERNAL SERVER ERROR} 500
                 * @message Internal Server Error!
                 * @responsetype {JSON}
                 */
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (!existingFood) {
                    res.status(405).json({
                        message: __1.FoodMessages.NO_FOOD_WITH_CODE_EXIST
                    });
                    return;
                }
                this.Ingredients.findOne({ code: ingredient }).exec((err, existingIngredient) => {
                    /**
                     * If error in fetching User
                     * @return {Response}
                     * @status {INTERNAL SERVER ERROR} 500
                     * @message Internal Server Error!
                     * @responsetype {JSON}
                     */
                    if (err) {
                        console.error(err);
                        res.status(500).json({
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    if (!existingIngredient) {
                        res.status(405).json({
                            message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                        });
                        return;
                    }
                    this.FoodIngredients.updateOne({
                        food: existingFood._id,
                        ingredient: existingIngredient._id
                    }, {
                        $set: {
                            qty,
                            updated_by: created_by,
                            updated_at: moment.utc().toDate()
                        }
                    }).exec((err, updateDetails) => {
                        /**
                         * If error in fetching User
                         * @return {Response}
                         * @status {INTERNAL SERVER ERROR} 500
                         * @message Internal Server Error!
                         * @responsetype {JSON}
                         */
                        if (err) {
                            console.error(err);
                            res.status(500).json({
                                message: __1.Messages.INTERNAL_SERVER_ERROR
                            });
                            return;
                        }
                        res.json({
                            message: __1.FoodMessages.UPDATE_ONE
                        });
                    });
                });
            });
        });
        this.deleteFood = (req, res, next) => {
            let { code } = req.body;
            if (!code) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Food.deleteOne({ code }).exec((err, deleteDetails) => {
                /**
                 * If error in fetching User
                 * @return {Response}
                 * @status {INTERNAL SERVER ERROR} 500
                 * @message Internal Server Error!
                 * @responsetype {JSON}
                 */
                if (err) {
                    console.error(err);
                    res.status(500).json({
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (deleteDetails.deletedCount === 0) {
                    res.status(400).json({
                        message: __1.FoodMessages.NO_FOOD_WITH_CODE_EXIST
                    });
                    return;
                }
                res.json({
                    message: __1.FoodMessages.DELETE_ONE,
                    deletedCount: deleteDetails.deletedCount
                });
            });
        };
    }
}
exports.Food = Food;
//# sourceMappingURL=food.service.js.map