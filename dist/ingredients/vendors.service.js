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
        this.createVendor = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { name, code, contact, created_by } = req.body;
            try {
                yield __1.VendorSchemaValidator.validateAsync({
                    name,
                    code,
                    contact
                });
                this.Vendors.findOne({ code })
                    .populate('created_by')
                    .exec((err, existingVendor) => {
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
                    if (existingVendor) {
                        res.status(405).json({
                            message: __1.VendorMessages.VENDOR_WITH_CODE_EXIST,
                            vendor: existingVendor
                        });
                    }
                    let _vendor = new this.Vendors({
                        name,
                        code,
                        contact,
                        created_by,
                        updated_by: created_by
                    });
                    _vendor.save((err, savedVendor) => __awaiter(this, void 0, void 0, function* () {
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
                            type: 'vendor',
                            req_url: req.url,
                            req_method: req.method,
                            status: __1.userLogStatus.SUCCESS,
                            user: created_by
                        })).save();
                        res.json({
                            message: __1.VendorMessages.CREATED,
                            vendor: savedVendor
                        });
                    }));
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
        this.getVendorByNameOrCode = (req, res, next) => {
            let { name, code } = req.query;
            let query = {};
            if (name)
                query['name'] = name;
            if (code)
                query['code'] = code;
            if (query === {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Vendors.findOne(query)
                .populate('created_by')
                .populate('updated_by')
                .exec((err, vendor) => {
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
                    vendor
                });
            });
        };
        this.getVendorByStatus = (req, res, next) => {
            let { status } = req.query;
            status = +status;
            if (!status || status === NaN) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.Vendors.find({ status })
                .populate('created_by')
                .exec((err, vendor) => {
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
                    vendor
                });
            });
        };
        this.updateVendorByCode = (req, res, next) => {
            let { code, contact, status, created_by } = req.body;
            let $set = {};
            if (contact)
                $set['contact'] = contact;
            if (status)
                $set['status'] = status;
            if (!code || $set == {}) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            $set['updated_at'] = moment.utc().toDate();
            $set['updated_by'] = created_by;
            this.Vendors.updateOne({ code }, { $set }).exec((err, updateDetails) => {
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
                        message: __1.VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                    });
                    return;
                }
                res.json({
                    message: __1.VendorMessages.UPDATE_ONE
                });
            });
        };
        this.deleteVendors = (req, res, next) => {
            let { code } = req.query;
            if (!code) {
                res.status(405).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            try {
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
                    if (deleteDetails.deletedCount === 0) {
                        res.status(400).json({
                            message: __1.VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                        });
                        return;
                    }
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