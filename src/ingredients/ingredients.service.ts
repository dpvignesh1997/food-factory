import { Request, Response, NextFunction } from 'express';
import { Model, Document } from "mongoose";
import {
    UserModel,
    userInterface,
    Messages,
    IngredientMessages,
    VendorMessages,
    UserLogModel,
    userLogInterface,
    userLogStatus,
    VendorsModel,
    vendorsInterface,
    IngredientsModel,
    ingredientsInterface,
    IngredientsSchemaValidator
} from "..";
import moment = require('moment');

/**
 * Definition for Ingredients management
 * @exports Ingredients
 * @access constructor
 * @classdesc class for Ingredients CRUD
 */
export class Ingredients {

    // User Model reference
    User: Model<userInterface> = new UserModel().getModel();
    // User Log Model reference
    UserLog: Model<userLogInterface> = new UserLogModel().getModel();
    // Vendors Model reference
    Vendors: Model<vendorsInterface> = new VendorsModel().getModel();
    // Ingredients Model reference
    Ingredients: Model<ingredientsInterface> = new IngredientsModel().getModel();

    constructor() { }

    /**
     * Create Ingredient
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (name, code, available_qty, threshold_qty, vendor)
     * @returns {JSON} res
     */
    createIngredient = async (req: Request, res: Response, next: NextFunction) => {
        let { name, code, available_qty, threshold_qty, vendor, created_by } = req.body;

        try {
            // Validate Inputs With Joi Schema Validator
            await IngredientsSchemaValidator.validateAsync({
                name,
                code,
                available_qty,
                threshold_qty,
                vendor
            })

            // Check if Ingredeint with provided code already exists
            this.Ingredients.findOne({ code }).exec((err, existingIngredient) => {
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

                /**
                 * If Ingredeint Exists
                 * @return {Response}
                 * @status {INVALID INPUT} 405
                 * @message Ingredient with provided code already exists!
                 * @responsetype {JSON}
                 */
                if (existingIngredient) {
                    res.status(405).json({
                        message: IngredientMessages.INGREDEINT_WITH_CODE_EXIST,
                        ingredient: existingIngredient
                    })
                    return
                }

                // Check if provided Vendor is Valid
                this.Vendors.findOne({ code: vendor }).exec((err, _vendor) => {
                    /**
                     * If error in fetching Vendor
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

                    /**
                    * If Vendor does not Exists
                    * @return {Response}
                    * @status {INVALID INPUT} 405
                    * @message Ingredient with provided code already exists!
                    * @responsetype {JSON}
                    */
                    if (!vendor) {
                        res.json(406).json({
                            message: IngredientMessages.VENDOR_NOT_AVAILBLE
                        })
                        return
                    }

                    // Create Mongo Document for Ingredient
                    let _ingredient: Document = new this.Ingredients({
                        name,
                        code,
                        available_qty,
                        threshold_qty,
                        vendor: _vendor._id,
                        created_by,
                        updated_by: created_by
                    })

                    // Save Ingredient
                    _ingredient.save(async (err, savedIngredient) => {
                        /**
                         * If error in Saving Ingredient
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
                            type: 'ingredient',
                            req_url: req.url,
                            req_method: req.method,
                            status: userLogStatus.SUCCESS,
                            user: created_by
                        })).save();

                        // If Ingredeint is created successfully
                        res.json({
                            message: IngredientMessages.CREATED,
                            ingredient: savedIngredient
                        })
                    })
                })
            })
        } catch (error) {
            /**
            * Error throw from Schema Input Validation
            * @return {Response}
            * @status {INVALID INPUT} 405
            * @message Ingredient with provided code already exists!
            * @responsetype {JSON}
            */
            console.error(error);
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }

    /**
     * Get Ingredient by Name or Code
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (name & code)
     * @returns {JSON} res
     */
    getIngredientByNameOrCode = (req: Request, res: Response, next: NextFunction) => {

        // Parse name and Code from Request Query
        let { name, code } = req.query;

        // Create Query to find in Ingredients Schema
        let query = {}
        if (name) query['name'] = name;
        if (code) query['code'] = code;

        // If Query parameters are empty
        if (query === {}) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Find Ingredeint with Requested Query
        this.Ingredients.findOne(query)
            .populate('created_by')
            .populate('updated_by')
            .exec((err, ingredient) => {
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

                //  If No Ingredeint is fooudn
                if (!ingredient) {
                    res.status(405).json({
                        message: IngredientMessages.NO_ENTRIES_FOUND
                    })
                    return
                }

                // If Ingeredeint exists
                res.json({
                    ingredient
                })
            })
    }

    /**
     * Get Ingredient by Vendor
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (vendor)
     * @returns {JSON} res
     */
    getIngredientByVendor = (req: Request, res: Response, next: NextFunction) => {

        // Parse Vendor from Request Query
        let { vendor } = req.query;

        // If Request Query does not have vendor key
        if (!vendor) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Check if Vendor exists in Vendor Schema
        this.Vendors.findOne({ code: vendor }).exec((err, _vendor) => {
            /**
             * If error in fetching Vendor
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

            // Vendor does not exists
            if (!vendor) {
                res.status(400).json({
                    message: VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                })
                return
            }

            // If Vendor exists
            this.Ingredients.find({ vendor: _vendor._id })
                .populate('created_by')
                .populate('updated_by')
                .exec((err, ingredients) => {
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

                    // Return Found Ingredeints
                    res.json({
                        ingredients
                    })
                })
        })
    }


    /**
     * Get Ingredients whose Avaialble quantity is less than Threshold quantity
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @returns {JSON} res
     */
    getIngredientsLessThanThresholdQty = (req: Request, res: Response, next: NextFunction) => {

        this.Ingredients.find({ $where: "this.available_qty < this.threshold_qty" }).exec((err, ingredients) => {
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
                ingredients
            })
        })
    }

    /**
     * Update Ingredient's Name, Avaialble Qty & Threshold Qty by Code
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (code, name, available_qty, threshold_qty)
     * @returns {JSON} res
     */
    updateIngredientByCode = (req: Request, res: Response, next: NextFunction) => {

        // Parse Request Body
        let { code, name, available_qty, threshold_qty, created_by } = req.body;

        // Update Object
        let $set = {}
        if (name) $set['name'] = name;
        if (available_qty) $set['available_qty'] = available_qty;
        if (threshold_qty) $set['threshold_qty'] = threshold_qty;

        // If either code nor $set is empty
        if (!code || $set === {}) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Set updated_at & updated_by
        $set['updated_at'] = moment.utc().toDate();
        $set['updated_by'] = created_by;

        // Check if Ingredient Code provided is valid
        this.Ingredients.updateOne({ code }, { $set }).exec((err, updateDetails) => {
            /**
             * If error in fetching Ingredients
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

            // If No Update is done
            if (updateDetails.nModified === 0) {
                res.status(400).json({
                    message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                })
                return
            }

            // If Updated successfully
            res.json({
                message: IngredientMessages.UPDATE_ONE,
            })
        })
    }

    /**
     * Delete Ingredient By Code
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (code)
     * @returns {JSON} res
     */
    deleteIngredients = (req: Request, res: Response, next: NextFunction) => {

        // Parse code from Request Body
        let { code } = req.query;

        // If there is no code key in Request Query
        if (!code) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        try {
            // Delete Ingredeint
            this.Ingredients.deleteOne({ code }).exec((err, deleteDetails) => {
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

                // If nothing deleted
                if (deleteDetails.deletedCount === 0) {
                    res.status(400).json({
                        message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                    })
                    return
                }

                // On successful delete
                res.json({
                    message: IngredientMessages.DELETE_ONE,
                })
            })
        } catch (error) {
            // If any error in fetching Ingredient
            console.error(error)
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }
}