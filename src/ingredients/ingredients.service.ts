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

    createIngredient = async (req: Request, res: Response, next: NextFunction) => {
        let { name, code, available_qty, threshold_qty, vendor, created_by } = req.body;

        try {
            await IngredientsSchemaValidator.validateAsync({
                name,
                code,
                available_qty,
                threshold_qty,
                vendor
            })

            this.Ingredients.findOne({ code }).exec((err, existingIngredient) => {
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

                if (existingIngredient) {
                    res.status(405).json({
                        message: IngredientMessages.INGREDEINT_WITH_CODE_EXIST,
                        ingredient: existingIngredient
                    })
                    return
                }

                this.Vendors.findOne({ code: vendor }).exec((err, _vendor) => {
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

                    if (!vendor) {
                        res.json(406).json({
                            message: IngredientMessages.VENDOR_NOT_AVAILBLE
                        })
                        return
                    }

                    let _ingredient: Document = new this.Ingredients({
                        name,
                        code,
                        available_qty,
                        threshold_qty,
                        vendor: _vendor._id,
                        created_by,
                        updated_by: created_by
                    })

                    _ingredient.save(async (err, savedIngredient) => {
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
                            type: 'ingredient',
                            req_url: req.url,
                            req_method: req.method,
                            status: userLogStatus.SUCCESS,
                            user: created_by
                        })).save();

                        res.json({
                            message: IngredientMessages.CREATED,
                            ingredient: savedIngredient
                        })
                    })
                })
            })
        } catch (error) {
            console.error(error);
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }

    getIngredientByNameOrCode = (req: Request, res: Response, next: NextFunction) => {

        let { name, code } = req.query;
        let query = {}
        if (name) query['name'] = name;
        if (code) query['code'] = code;

        if (query === {}) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        this.Ingredients.findOne(query)
            .populate('created_by')
            .populate('updated_by')
            .exec((err, ingredient) => {
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
                    ingredient
                })
            })
    }

    getIngredientByVendor = (req: Request, res: Response, next: NextFunction) => {

        let { vendor } = req.query;

        if (!vendor) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        this.Vendors.findOne({ code: vendor }).exec((err, _vendor) => {
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

            if (!vendor) {
                res.status(400).json({
                    message: VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                })
                return
            }

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

                    res.json({
                        ingredients
                    })
                })
        })
    }

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

    updateIngredientByCode = (req: Request, res: Response, next: NextFunction) => {
        let { code, name, available_qty, threshold_qty, created_by } = req.body;

        let $set = {}
        if (name) $set['name'] = name;
        if (available_qty) $set['available_qty'] = available_qty;
        if (threshold_qty) $set['threshold_qty'] = threshold_qty;

        if (!code || $set === {}) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        $set['updated_at'] = moment.utc().toDate();
        $set['updated_by'] = created_by;

        this.Ingredients.updateOne({ code }, { $set }).exec((err, updateDetails) => {
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

            if (updateDetails.nModified === 0) {
                res.status(400).json({
                    message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                })
                return
            }

            res.json({
                message: IngredientMessages.UPDATE_ONE,
            })
        })
    }

    deleteIngredients = (req: Request, res: Response, next: NextFunction) => {
        let { code } = req.body;
        if (!code) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        try {
            this.Ingredients.deleteOne({ code }).exec((err, deleteDetails) => {
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
                        message: IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                    })
                    return
                }

                res.json({
                    message: IngredientMessages.DELETE_ONE,
                })
            })
        } catch (error) {
            console.error(error)
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }
}