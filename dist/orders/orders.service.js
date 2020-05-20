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
const helpers_1 = require("./helpers");
const moment = require("moment");
const mongodb_1 = require("mongodb");
/**
 * Definition for Order management
 * @exports Order
 * @access constructor
 * @classdesc class for Order CRUD
 */
class Order {
    constructor() {
        // User Model reference
        this.User = new __1.UserModel().getModel();
        // User Log Model reference
        this.UserLog = new __1.UserLogModel().getModel();
        // Ingredients Model reference
        this.Ingredients = new __1.IngredientsModel().getModel();
        // Food Model reference
        this.Food = new __1.FoodModel().getModel();
        // FoodIngredients Model reference
        this.FoodIngredients = new __1.FoodIngredientsModel().getModel();
        // Orders Model reference
        this.Orders = new __1.OrdersModel().getModel();
        // OrderedFood Model reference
        this.OrderedFood = new __1.OrderedFoodModel().getModel();
        // Orders Helper reference
        this.ordersHelper = new helpers_1.OrdersHelper();
        this.placeOrder = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            let { food, created_by } = req.body;
            try {
                yield __1.OrdersSchemaValidator.validateAsync({
                    food
                });
                this.ordersHelper.isSufficientIngredientsAvailable(food).then(status => {
                    this.ordersHelper.placeOrder(status['requiredIngredientsQty']).then(() => {
                        let newOrder = new this.Orders({
                            user: created_by,
                            order_total: status['order_total']
                        });
                        newOrder.save((err, savedOrder) => __awaiter(this, void 0, void 0, function* () {
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
                            yield this.OrderedFood.collection.insertMany(status['orderedFood'].map(_of => (Object.assign(Object.assign({}, _of), { order: savedOrder._id, created_at: moment.utc().toDate() }))));
                            res.json({
                                message: __1.OrderMessages.CREATED,
                                order: savedOrder
                            });
                            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                                yield this.Orders.updateOne({ _id: savedOrder._id, status: __1.OrderStatus.PENDING }, {
                                    $set: {
                                        updated_at: moment.utc().toDate(),
                                        status: __1.OrderStatus.DELIVERED
                                    }
                                }).exec();
                            }), 60000);
                        }));
                    }).catch(error => {
                        console.error(error);
                        res.status(400).json({
                            message: __1.Messages.INPUT_NOT_VALID
                        });
                        return;
                    });
                }).catch(error => {
                    res.status(400).json(error);
                    return;
                });
            }
            catch (error) {
                console.error(error);
                res.status(400).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
        });
        this.getOrdersOfUser = (req, res, next) => {
            let { user } = req.query;
            if (!user) {
                res.status(400).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            this.User.findOne({ username: user }).exec((err, _user) => {
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
                if (!user) {
                    res.status(405).json({
                        message: __1.OrderMessages.USER_NOT_FOUND
                    });
                    return;
                }
                this.Orders.find({ user: _user._id }).exec((err, orders) => {
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
                    if (orders.length === 0) {
                        res.json({
                            message: __1.OrderMessages.NO_ENTRIES_FOUND
                        });
                        return;
                    }
                    res.json(orders);
                });
            });
        };
        this.cancelOrder = (req, res, next) => {
            let { order } = req.body;
            if (!order) {
                res.status(400).json({
                    message: __1.Messages.INPUT_NOT_VALID
                });
                return;
            }
            try {
                this.Orders.findOne({ _id: new mongodb_1.ObjectId(order) }).exec((err, _order) => __awaiter(this, void 0, void 0, function* () {
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
                    if (!order) {
                        res.status(405).json({
                            message: __1.OrderMessages.NO_ORDER_EXIST
                        });
                        return;
                    }
                    if (_order.status === __1.OrderStatus.DELIVERED) {
                        res.status(400).json({
                            message: __1.OrderMessages
                        });
                        return;
                    }
                    _order.status = __1.OrderStatus.CANCELLED;
                    yield _order.save();
                    res.json({
                        message: __1.OrderMessages.ORDER_CANCELLED
                    });
                }));
            }
            catch (error) {
                console.error(error);
                res.status(400).json({
                    message: __1.OrderMessages.NO_ORDER_EXIST
                });
            }
        };
    }
}
exports.Order = Order;
//# sourceMappingURL=orders.service.js.map