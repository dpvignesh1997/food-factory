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
 * Definition for Ingredients management
 * @exports Ingredients
 * @access constructor
 * @classdesc class for Ingredients CRUD
 */
class Ingredients {
    constructor() {
        // User Model reference
        this.User = new __1.UserModel().getModel();
        // User Log Model reference
        this.UserLog = new __1.UserLogModel().getModel();
        // Vendors Model reference
        this.Vendors = new __1.VendorsModel().getModel();
        // Ingredients Model reference
        this.Ingredients = new __1.IngredientsModel().getModel();
        /**
         * Create Ingredient
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (name, code, available_qty, threshold_qty, vendor)
         * @returns {JSON} res
         */
        this.createIngredient = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { name, code, available_qty, threshold_qty, vendor, created_by } = req.body;
            try {
                // Validate Inputs With Joi Schema Validator
                yield __1.IngredientsSchemaValidator.validateAsync({
                    name,
                    code,
                    available_qty,
                    threshold_qty,
                    vendor
                });
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
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
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
                            message: __1.IngredientMessages.INGREDEINT_WITH_CODE_EXIST,
                            ingredient: existingIngredient
                        });
                        return;
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
                                message: __1.Messages.INTERNAL_SERVER_ERROR
                            });
                            return;
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
                                message: __1.IngredientMessages.VENDOR_NOT_AVAILBLE
                            });
                            return;
                        }
                        // Create Mongo Document for Ingredient
                        let _ingredient = new this.Ingredients({
                            name,
                            code,
                            available_qty,
                            threshold_qty,
                            vendor: _vendor._id,
                            created_by,
                            updated_by: created_by
                        });
                        // Save Ingredient
                        _ingredient.save((err, savedIngredient) => __awaiter(this, void 0, void 0, function* () {
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
                                    message: __1.Messages.INTERNAL_SERVER_ERROR
                                });
                                return;
                            }
                            // Create User Log
                            yield (new this.UserLog({
                                type: 'ingredient',
                                req_url: req.url,
                                req_method: req.method,
                                status: __1.userLogStatus.SUCCESS,
                                user: created_by
                            })).save();
                            // If Ingredeint is created successfully
                            res.json({
                                message: __1.IngredientMessages.CREATED,
                                ingredient: savedIngredient
                            });
                        }));
                    });
                });
            }
            catch (error) {
                /**
                * Error throw from Schema Input Validation
                * @return {Response}
                * @status {INVALID INPUT} 405
                * @message Ingredient with provided code already exists!
                * @responsetype {JSON}
                */
                console.error(error);
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
        });
        /**
         * Get Ingredient by Name or Code
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (name & code)
         * @returns {JSON} res
         */
        this.getIngredientByNameOrCode = (req, res, next) => {
            // Parse name and Code from Request Query
            let { name, code } = req.query;
            // Create Query to find in Ingredients Schema
            let query = {};
            if (name)
                query['name'] = name;
            if (code)
                query['code'] = code;
            // If Query parameters are empty
            if (query === {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                //  If No Ingredeint is fooudn
                if (!ingredient) {
                    res.status(405).json({
                        message: __1.IngredientMessages.NO_ENTRIES_FOUND
                    });
                    return;
                }
                // If Ingeredeint exists
                res.json({
                    ingredient
                });
            });
        };
        /**
         * Get Ingredient by Vendor
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (vendor)
         * @returns {JSON} res
         */
        this.getIngredientByVendor = (req, res, next) => {
            // Parse Vendor from Request Query
            let { vendor } = req.query;
            // If Request Query does not have vendor key
            if (!vendor) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                // Vendor does not exists
                if (!vendor) {
                    res.status(400).json({
                        message: __1.VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                    });
                    return;
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
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    // Return Found Ingredeints
                    res.json({
                        ingredients
                    });
                });
            });
        };
        /**
         * Get Ingredients whose Avaialble quantity is less than Threshold quantity
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @returns {JSON} res
         */
        this.getIngredientsLessThanThresholdQty = (req, res, next) => {
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                res.json({
                    ingredients
                });
            });
        };
        /**
         * Update Ingredient's Name, Avaialble Qty & Threshold Qty by Code
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (code, name, available_qty, threshold_qty)
         * @returns {JSON} res
         */
        this.updateIngredientByCode = (req, res, next) => {
            // Parse Request Body
            let { code, name, available_qty, threshold_qty, created_by } = req.body;
            // Update Object
            let $set = {};
            if (name)
                $set['name'] = name;
            if (available_qty)
                $set['available_qty'] = available_qty;
            if (threshold_qty)
                $set['threshold_qty'] = threshold_qty;
            // If either code nor $set is empty
            if (!code || $set === {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                // If No Update is done
                if (updateDetails.nModified === 0) {
                    res.status(400).json({
                        message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                    });
                    return;
                }
                // If Updated successfully
                res.json({
                    message: __1.IngredientMessages.UPDATE_ONE,
                });
            });
        };
        /**
         * Delete Ingredient By Code
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (code)
         * @returns {JSON} res
         */
        this.deleteIngredients = (req, res, next) => {
            // Parse code from Request Body
            let { code } = req.query;
            // If there is no code key in Request Query
            if (!code) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    // If nothing deleted
                    if (deleteDetails.deletedCount === 0) {
                        res.status(400).json({
                            message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                        });
                        return;
                    }
                    // On successful delete
                    res.json({
                        message: __1.IngredientMessages.DELETE_ONE,
                    });
                });
            }
            catch (error) {
                // If any error in fetching Ingredient
                console.error(error);
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
        };
    }
}
exports.Ingredients = Ingredients;
//# sourceMappingURL=ingredients.service.js.map