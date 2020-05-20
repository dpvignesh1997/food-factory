import { Request, Response, NextFunction } from 'express';
import { Model, Document } from "mongoose";
import {
    UserModel,
    userInterface,
    Messages,
    FoodMessages,
    IngredientMessages,
    UserLogModel,
    userLogInterface,
    userLogStatus,
    IngredientsModel,
    ingredientsInterface,
    FoodModel,
    foodInterface,
    FoodsSchemaValidator,
    FoodIngredientsModel,
    foodIngredientsInterface
} from "..";
import moment = require('moment');

/**
 * Definition for Food management
 * @exports Food
 * @access constructor
 * @classdesc class for Food CRUD
 */
export class Food {

    // User Model reference
    User: Model<userInterface> = new UserModel().getModel();
    // User Log Model reference
    UserLog: Model<userLogInterface> = new UserLogModel().getModel();
    // Ingredients Model reference
    Ingredients: Model<ingredientsInterface> = new IngredientsModel().getModel();
    // Food Model reference
    Food: Model<foodInterface> = new FoodModel().getModel();
    // FoodIngredientsModel Model reference
    FoodIngredients: Model<foodIngredientsInterface> = new FoodIngredientsModel().getModel();

    constructor() { }

    createFood = async (req: Request, res: Response, next: NextFunction) => {
        let { name, code, ingredients, cost_of_production, selling_cost, created_by } = req.body;

        try {
            await FoodsSchemaValidator.validateAsync({
                name,
                code,
                ingredients,
                cost_of_production,
                selling_cost
            })

            this.Food.findOne({ code }).exec(async (err, existingFood) => {
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                if (existingFood) {
                    res.status(405).json({
                        message: FoodMessages.FOOD_WITH_CODE_EXIST,
                        food: existingFood
                    })
                    return
                }

                let _food: Document = new this.Food({
                    name,
                    code,
                    cost_of_production,
                    selling_cost,
                    created_by,
                    updated_by: created_by
                })

                let _ingredientsForFood = []
                for (let _ingredient of ingredients) {
                    let ingredient = await this.Ingredients.findOne({ code: _ingredient['ingredient'] }).exec();
                    if (!ingredient) {
                        res.status(405).json({
                            message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                        })
                        return
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

                _food.save(async (err, savedFood) => {
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
                            message: Messages.INTERNAL_SERVER_ERROR
                        })
                        return
                    }

                    await (new this.UserLog({
                        type: 'food',
                        req_url: req.url,
                        req_method: req.method,
                        status: userLogStatus.SUCCESS,
                        user: created_by
                    })).save();

                    await this.FoodIngredients.collection.insertMany(_ingredientsForFood.map(ig => ({ food: savedFood._id, ...ig })))

                    res.json({
                        message: FoodMessages.CREATED,
                        food: savedFood
                    })
                })
            })
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }

    getFoodByName = (req: Request, res: Response, next: NextFunction) => {

        let { name } = req.query;

        if (!name) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                if (!food) {
                    res.status(400).json({
                        message: FoodMessages.NO_FOOD_WITH_NAME_EXIST
                    })
                    return
                }

                res.json(food)
            })
    }

    getFoodCostOfProductionHigherThanSellingCost = (req: Request, res: Response, next: NextFunction) => {

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
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            if (food.length === 0) {
                res.json({
                    message: FoodMessages
                })
            }

            res.json(food)
        })
    }

    updateSellingOrProductionCost = (req: Request, res: Response, next: NextFunction) => {
        let { food, cost_of_production, selling_cost } = req.body;

        let $set = {}
        if (cost_of_production) $set['cost_of_production'] = cost_of_production;
        if (selling_cost) $set['selling_cost'] = selling_cost;

        if (!food || $set === {}) {
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            if (!existingFood) {
                res.status(405).json({
                    message: FoodMessages.NO_FOOD_WITH_CODE_EXIST
                })
                return
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                res.json({
                    message: FoodMessages.UPDATE_ONE
                })
            })
        })
    }

    updateIngredeintsOnFood = async (req: Request, res: Response, next: NextFunction) => {
        let { food, ingredient, qty, created_by } = req.body;

        if (!food) {
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            if (!existingFood) {
                res.status(405).json({
                    message: FoodMessages.NO_FOOD_WITH_CODE_EXIST
                })
                return
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                if (!existingIngredient) {
                    res.status(405).json({
                        message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                    })
                    return
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
                            message: Messages.INTERNAL_SERVER_ERROR
                        })
                        return
                    }

                    res.json({
                        message: FoodMessages.UPDATE_ONE
                    })
                })
            })
        })
    }

    deleteFood = (req: Request, res: Response, next: NextFunction) => {
        let { code } = req.body;
        if (!code) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            if (deleteDetails.deletedCount === 0) {
                res.status(400).json({
                    message: FoodMessages.NO_FOOD_WITH_CODE_EXIST
                })
                return
            }

            res.json({
                message: FoodMessages.DELETE_ONE,
                deletedCount: deleteDetails.deletedCount
            })
        })
    }
}