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
 * Definition for Vendors management
 * @exports Vendors
 * @access constructor
 * @classdesc class for Vendors CRUD
 */
class Vendors {
    constructor() {
        // User Model reference
        this.User = new __1.UserModel().getModel();
        // User Log Model reference
        this.UserLog = new __1.UserLogModel().getModel();
        // Vendors Model reference
        this.Vendors = new __1.VendorsModel().getModel();
        /**
         * Create Vendor
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (name, code, contact)
         * @returns {JSON} res
         */
        this.createVendor = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // Parse name, code, contact from Request Body
            let { name, code, contact, created_by } = req.body;
            try {
                // Validate Request Inputs
                yield __1.VendorSchemaValidator.validateAsync({
                    name,
                    code,
                    contact
                });
                // Check if Vendor already exists
                this.Vendors.findOne({ code })
                    .populate('created_by')
                    .exec((err, existingVendor) => {
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
                    // If Vendor with provided code already exists
                    if (existingVendor) {
                        res.status(405).json({
                            message: __1.VendorMessages.VENDOR_WITH_CODE_EXIST,
                            vendor: existingVendor
                        });
                    }
                    // Create Mongo Document for Vendor
                    let _vendor = new this.Vendors({
                        name,
                        code,
                        contact,
                        created_by,
                        updated_by: created_by
                    });
                    // Save Document
                    _vendor.save((err, savedVendor) => __awaiter(this, void 0, void 0, function* () {
                        /**
                        * If error in Saving Vendor
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
                        // Create User log
                        yield (new this.UserLog({
                            type: 'vendor',
                            req_url: req.url,
                            req_method: req.method,
                            status: __1.userLogStatus.SUCCESS,
                            user: created_by
                        })).save();
                        // On successful Vendor Creation
                        res.json({
                            message: __1.VendorMessages.CREATED,
                            vendor: savedVendor
                        });
                    }));
                });
            }
            catch (error) {
                // If error in Inputy Validation
                console.error(error);
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
        });
        /**
         * Get Vendor by Name or Code
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (name, code)
         * @returns {JSON} res
         */
        this.getVendorByNameOrCode = (req, res, next) => {
            // Parse name, code from Request Body
            let { name, code } = req.query;
            // Create Find Query from request parameters
            let query = {};
            if (name)
                query['name'] = name;
            if (code)
                query['code'] = code;
            // If Find is Empty
            if (query === {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            // Find Vendor with created Query
            this.Vendors.findOne(query)
                .populate('created_by')
                .populate('updated_by')
                .exec((err, vendor) => {
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
                if (!vendor) {
                    res.status(405).json({
                        message: __1.VendorMessages.NO_ENTRIES_FOUND
                    });
                    return;
                }
                res.json({
                    vendor
                });
            });
        };
        /**
         * Get Vendor by Status
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (status)
         * @returns {JSON} res
         */
        this.getVendorByStatus = (req, res, next) => {
            // Parse Status from Request Query
            let { status } = req.query;
            status = +status;
            // If no status param provided or if status is not a number
            if (!status || status === NaN) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            // Find Vendor with provided status
            this.Vendors.find({ status })
                .populate('created_by')
                .exec((err, vendor) => {
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
                res.json({
                    vendor
                });
            });
        };
        /**
         * Update Vendor by Code
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (code, name, contact, status)
         * @returns {JSON} res
         */
        this.updateVendorByCode = (req, res, next) => {
            // Parse code, name, contact, status from Request Body
            let { code, name, contact, status, created_by } = req.body;
            // Create update Object
            let $set = {};
            if (name)
                $set['name'] = name;
            if (contact)
                $set['contact'] = contact;
            if (status)
                $set['status'] = status;
            // If no code provided in params or if Update Object is empty
            if (!code || $set == {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            // Set updated_at & updated_by
            $set['updated_at'] = moment.utc().toDate();
            $set['updated_by'] = created_by;
            // Update Vendor
            this.Vendors.updateOne({ code }, { $set }).exec((err, updateDetails) => {
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
                // If nothing updated
                if (updateDetails.nModified === 0) {
                    res.status(400).json({
                        message: __1.VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                    });
                    return;
                }
                // On successful update
                res.json({
                    message: __1.VendorMessages.UPDATE_ONE
                });
            });
        };
        /**
         * Delete Vendor by Code
         * @method (POST)
         * @param {Request} req
         * @param {Response} res
         * @param {NextFunction} next
         * @requires (code)
         * @returns {JSON} res
         */
        this.deleteVendors = (req, res, next) => {
            // Parse code from Request Query
            let { code } = req.query;
            // If no Code is provided in Request Query
            if (!code) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            try {
                // Delete Vendor
                this.Vendors.deleteOne({ code }).exec((err, deleteDetails) => {
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
                    // If nothing Deleted
                    if (deleteDetails.deletedCount === 0) {
                        res.status(400).json({
                            message: __1.VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                        });
                        return;
                    }
                    // on Successful delete
                    res.json({
                        message: __1.VendorMessages.DELETE_ONE,
                        deletedCount: deleteDetails.deletedCount
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
exports.Vendors = Vendors;
//# sourceMappingURL=vendors.service.js.map