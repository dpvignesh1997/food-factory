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
        this.createIngredient = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { name, code, available_qty, threshold_qty, vendor, created_by } = req.body;
            try {
                yield __1.IngredientsSchemaValidator.validateAsync({
                    name,
                    code,
                    available_qty,
                    threshold_qty,
                    vendor
                });
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
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    if (existingIngredient) {
                        res.status(405).json({
                            message: __1.IngredientMessages.INGREDEINT_WITH_CODE_EXIST,
                            ingredient: existingIngredient
                        });
                        return;
                    }
                    this.Vendors.findOne({ _id: vendor }).exec((err, _vendor) => {
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
                        if (!vendor) {
                            res.json(406).json({
                                message: __1.IngredientMessages.VENDOR_NOT_AVAILBLE
                            });
                            return;
                        }
                        let _ingredient = new this.Ingredients({
                            name,
                            code,
                            available_qty,
                            threshold_qty,
                            vendor: _vendor._id,
                            created_by,
                            updated_by: created_by
                        });
                        _ingredient.save((err, savedIngredient) => __awaiter(this, void 0, void 0, function* () {
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
                                type: 'ingredient',
                                req_url: req.url,
                                req_method: req.method,
                                status: __1.userLogStatus.SUCCESS,
                                user: created_by
                            })).save();
                            res.json({
                                message: __1.IngredientMessages.CREATED,
                                ingredient: savedIngredient
                            });
                        }));
                    });
                });
            }
            catch (error) {
                console.error(error);
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
        });
        this.getIngredientByName = (req, res, next) => {
            let { name } = req.query;
            if (!name) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Ingredients.findOne({ name })
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                res.json({
                    ingredient
                });
            });
        };
        this.getIngredientByVendor = (req, res, next) => {
            let { vendor } = req.query;
            if (!vendor) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (!vendor) {
                    res.status(400).json({
                        message: __1.VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                    });
                    return;
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
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    res.json({
                        ingredients
                    });
                });
            });
        };
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
        this.updateIngredientByCode = (req, res, next) => {
            let { code, available_qty, threshold_qty, created_by } = req.body;
            let $set = {};
            if (available_qty)
                $set['available_qty'] = available_qty;
            if (threshold_qty)
                $set['threshold_qty'] = threshold_qty;
            if (!code || $set === {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                        message: __1.Messages.INTERNAL_SERVER_ERROR
                    });
                    return;
                }
                if (updateDetails.nModified === 0) {
                    res.status(400).json({
                        message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                    });
                    return;
                }
                res.json({
                    message: __1.IngredientMessages.UPDATE_ONE,
                });
            });
        };
        this.deleteIngredients = (req, res, next) => {
            let { code } = req.body;
            if (!code) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
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
                            message: __1.Messages.INTERNAL_SERVER_ERROR
                        });
                        return;
                    }
                    if (deleteDetails.deletedCount === 0) {
                        res.status(400).json({
                            message: __1.IngredientMessages.NO_INGREDEINT_WITH_CODE_EXIST
                        });
                        return;
                    }
                    res.json({
                        message: __1.IngredientMessages.DELETE_ONE,
                    });
                });
            }
            catch (error) {
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