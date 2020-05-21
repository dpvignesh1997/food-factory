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

    /**
     * Create Food
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (name, code, ingredients, cost_of_production, selling_cost)
     * @returns {JSON} res
     */
    createFood = async (req: Request, res: Response, next: NextFunction) => {

        // Parse name, code, ingredients, cost_of_production, selling_cost from Request Body
        let { name, code, ingredients, cost_of_production, selling_cost, created_by } = req.body;

        try {
            // Validate Request Inputs
            await FoodsSchemaValidator.validateAsync({
                name,
                code,
                ingredients,
                cost_of_production,
                selling_cost
            })

            // Check if Food with provided Code Already exist
            this.Food.findOne({ code }).exec(async (err, existingFood) => {
                /**
                 * If error in fetching Food
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

                // If Food with provided code exists
                if (existingFood) {
                    res.status(405).json({
                        message: FoodMessages.FOOD_WITH_CODE_EXIST,
                        food: existingFood
                    })
                    return
                }

                // Create Mongo Document for Food
                let _food: Document = new this.Food({
                    name,
                    code,
                    cost_of_production,
                    selling_cost,
                    created_by,
                    updated_by: created_by
                })

                // Prepare FoodIngredients Schema Docuements
                let _ingredientsForFood = []
                for (let _ingredient of ingredients) {
                    let ingredient = await this.Ingredients.findOne({ code: _ingredient['ingredient'] }).exec();
                    if (!ingredient) {
                        // If Provided Ingredient Code does not Exists
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

                // Save Food Document 
                _food.save(async (err, savedFood) => {
                    /**
                     * If error in Saving Food
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

                    // Create User Log
                    await (new this.UserLog({
                        type: 'food',
                        req_url: req.url,
                        req_method: req.method,
                        status: userLogStatus.SUCCESS,
                        user: created_by
                    })).save();

                    // Insert Records onto FoodIngredients Schema
                    await this.FoodIngredients.collection.insertMany(_ingredientsForFood.map(ig => ({ food: savedFood._id, ...ig })))

                    // On successful Food entry
                    res.json({
                        message: FoodMessages.CREATED,
                        food: savedFood
                    })
                })
            })
        } catch (error) {
            // If Error in Input Validation
            console.error(error);
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }

    /**
     * Get Food by Name or Code
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (name, code)
     * @returns {JSON} res
     */
    getFoodByNameOrCode = (req: Request, res: Response, next: NextFunction) => {

        // Parse name, code from Request Query
        let { name, code } = req.query;

        // Prepare Find Query
        let query = {}
        if (name) query['name'] = name;
        if (code) query['code'] = code;

        // If Parameter is provided in Request Query
        if (query === {}) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Find Food
        this.Food.findOne(query)
            .populate('created_by')
            .populate('updated_by')
            .exec((err, food) => {
                /**
                 * If error in fetching Food
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

                // If Food is not found for provided inputs
                if (!food) {
                    res.status(400).json({
                        message: FoodMessages.NO_FOOD_WITH_NAME_EXIST
                    })
                    return
                }

                res.json({
                    food
                })
            })
    }

    /**
     * Get Food in which Cost of Production is Higher than the Selling Cost
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {JSON} res
     */
    getFoodCostOfProductionHigherThanSellingCost = (req: Request, res: Response, next: NextFunction) => {

        this.Food.find({ $where: "this.cost_of_production > this.selling_cost" }).exec((err, food) => {
            /**
             * If error in fetching Food
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

            // If No Entries found
            if (food.length === 0) {
                res.json({
                    message: FoodMessages.NO_ENTRIES_FOUND
                })
            }

            res.json({
                food
            })
        })
    }

    /**
     * Update Food by Code
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (food, name, cost_of_production, selling_cost)
     * @returns {JSON} res
     */
    updateSellingOrProductionCost = (req: Request, res: Response, next: NextFunction) => {

        // Parse food, name, cost_of_production, selling_cost from Request Body
        let { food, name, cost_of_production, selling_cost, created_by } = req.body;

        // Create Update Object
        let $set = {}
        if (name) $set['name'] = name;
        if (cost_of_production) $set['cost_of_production'] = cost_of_production;
        if (selling_cost) $set['selling_cost'] = selling_cost;

        // If Food or Update paramters are empty
        if (!food || $set === {}) {
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Set updated_at & updated_by
        $set['updated_at'] = moment.utc().toDate();
        $set['updated_by'] = created_by;

        // Check if code provided for food exists
        this.Food.findOne({ code: food }).exec((err, existingFood) => {
            /**
             * If error in fetching Food
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

            // If provided Code does not exists
            if (!existingFood) {
                res.status(405).json({
                    message: FoodMessages.NO_FOOD_WITH_CODE_EXIST
                })
                return
            }

            // Update the Food
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

    /**
     * Get Ingredints Qty provided on Food
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (food, name, cost_of_production, selling_cost)
     * @returns {JSON} res
     */
    updateIngredeintsOnFood = async (req: Request, res: Response, next: NextFunction) => {

        // Parse food, ingredient, qty from Request Body
        let { food, ingredient, qty, created_by } = req.body;

        // If Food code or Ingredient Code or Qty is not provided
        if (!food || !ingredient || !qty) {
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Check if provided Food code exists
        this.Food.findOne({ code: food }).exec((err, existingFood) => {
            /**
             * If error in fetching Food
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

            // If Provided Food code does not exists
            if (!existingFood) {
                res.status(405).json({
                    message: FoodMessages.NO_FOOD_WITH_CODE_EXIST
                })
                return
            }

            // Check if provided Ingredient Code exists
            this.Ingredients.findOne({ code: ingredient }).exec((err, existingIngredient) => {
                /**
                 * If error in fetching Ingredient
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

                // If Provided Ingredient Code does not exists
                if (!existingIngredient) {
                    res.status(405).json({
                        message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                    })
                    return
                }

                // Update Food Ingredient
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

    /**
    * Delete Food By Code
    * @method (POST)
    * @param {Request} req
    * @param {Response} res
    * @param {NextFunction} next
    * @requires (code)
    * @returns {JSON} res
    */
    deleteFood = (req: Request, res: Response, next: NextFunction) => {

        // Parse code from Request Query
        let { code } = req.query;

        // Code Parameter is empty
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