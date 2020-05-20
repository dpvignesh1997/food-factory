import { Request, Response, NextFunction } from 'express';
import { Model, Document } from "mongoose";
import {
    UserModel,
    userInterface,
    Messages,
    UserLogModel,
    userLogInterface,
    userLogStatus,
    VendorsModel,
    vendorsInterface,
    VendorMessages,
    VendorSchemaValidator
} from "..";
import moment = require('moment');

/**
 * Definition for Vendors management
 * @exports Vendors
 * @access constructor
 * @classdesc class for Vendors CRUD
 */
export class Vendors {

    // User Model reference
    User: Model<userInterface> = new UserModel().getModel();
    // User Log Model reference
    UserLog: Model<userLogInterface> = new UserLogModel().getModel();
    // Vendors Model reference
    Vendors: Model<vendorsInterface> = new VendorsModel().getModel();

    constructor() { }

    createVendor = async (req: Request, res: Response, next: NextFunction) => {
        let { name, code, contact, created_by } = req.body;

        try {
            await VendorSchemaValidator.validateAsync({
                name,
                code,
                contact
            })

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
                            message: Messages.INTERNAL_SERVER_ERROR
                        })
                        return
                    }

                    if (existingVendor) {
                        res.status(405).json({
                            message: VendorMessages.VENDOR_WITH_CODE_EXIST,
                            vendor: existingVendor
                        })
                    }

                    let _vendor: Document = new this.Vendors({
                        name,
                        code,
                        contact,
                        created_by,
                        updated_by: created_by
                    })

                    _vendor.save(async (err, savedVendor) => {
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
                            type: 'vendor',
                            req_url: req.url,
                            req_method: req.method,
                            status: userLogStatus.SUCCESS,
                            user: created_by
                        })).save();

                        res.json({
                            message: VendorMessages.CREATED,
                            vendor: savedVendor
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

    getVendorByNameOrCode = (req: Request, res: Response, next: NextFunction) => {

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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                res.json({
                    vendor
                })
            })
    }

    getVendorByStatus = (req: Request, res: Response, next: NextFunction) => {

        let { status } = req.query;
        status = +status;

        if (!status || status === NaN) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                res.json({
                    vendor
                })
            })
    }

    updateVendorByCode = (req: Request, res: Response, next: NextFunction) => {
        let { code, contact, status, created_by } = req.body;

        let $set = {}
        if (contact) $set['contact'] = contact;
        if (status) $set['status'] = status;

        if (!code || $set == {}) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            if (updateDetails.nModified === 0) {
                res.status(400).json({
                    message: VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                })
                return
            }

            res.json({
                message: VendorMessages.UPDATE_ONE
            })
        })
    }

    deleteVendors = (req: Request, res: Response, next: NextFunction) => {
        let { code } = req.query;
        if (!code) {
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                if (deleteDetails.deletedCount === 0) {
                    res.status(400).json({
                        message: VendorMessages.NO_VENDOR_WITH_CODE_EXIST
                    })
                    return
                }

                res.json({
                    message: VendorMessages.DELETE_ONE,
                    deletedCount: deleteDetails.deletedCount
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