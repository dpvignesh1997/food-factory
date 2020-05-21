import { Request, Response, NextFunction } from 'express';
import { Model, Document } from "mongoose";
import {
    UserModel,
    userInterface,
    Messages,
    UserLogModel,
    userLogInterface,
    IngredientsModel,
    ingredientsInterface,
    FoodModel,
    foodInterface,
    FoodIngredientsModel,
    foodIngredientsInterface,
    OrdersModel,
    ordersInterface,
    OrderStatus,
    OrdersSchemaValidator,
    OrderedFoodModel,
    orderedFoodInterface,
    OrderMessages
} from "..";
import { OrdersHelper } from "./helpers";
import moment = require('moment');
import { ObjectId } from 'mongodb';

/**
 * Definition for Order management
 * @exports Order
 * @access constructor
 * @classdesc class for Order CRUD
 */
export class Order {

    // User Model reference
    User: Model<userInterface> = new UserModel().getModel();
    // User Log Model reference
    UserLog: Model<userLogInterface> = new UserLogModel().getModel();
    // Ingredients Model reference
    Ingredients: Model<ingredientsInterface> = new IngredientsModel().getModel();
    // Food Model reference
    Food: Model<foodInterface> = new FoodModel().getModel();
    // FoodIngredients Model reference
    FoodIngredients: Model<foodIngredientsInterface> = new FoodIngredientsModel().getModel();
    // Orders Model reference
    Orders: Model<ordersInterface> = new OrdersModel().getModel();
    // OrderedFood Model reference
    OrderedFood: Model<orderedFoodInterface> = new OrderedFoodModel().getModel();
    // Orders Helper reference
    ordersHelper = new OrdersHelper()

    constructor() { }

    placeOrder = async (req: Request, res: Response, next: NextFunction) => {
        let { food, created_by } = req.body;

        try {
            await OrdersSchemaValidator.validateAsync({
                food
            })

            this.ordersHelper.isSufficientIngredientsAvailable(food).then(status => {
                this.ordersHelper.placeOrder(status['requiredIngredientsQty']).then(() => {
                    let newOrder: Document = new this.Orders({
                        user: created_by,
                        order_total: status['order_total']
                    })

                    newOrder.save(async (err, savedOrder) => {
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

                        await this.OrderedFood.collection.insertMany(status['orderedFood'].map(_of => ({
                            ..._of, order: savedOrder._id, created_at: moment.utc().toDate()
                        })))

                        res.json({
                            message: OrderMessages.CREATED,
                            order: savedOrder
                        })

                        setTimeout(async () => {
                            await this.Orders.updateOne({ _id: savedOrder._id, status: OrderStatus.PENDING }, {
                                $set: {
                                    updated_at: moment.utc().toDate(),
                                    status: OrderStatus.DELIVERED
                                }
                            }).exec()
                        }, 60000);
                    })
                }).catch(error => {
                    console.error(error)
                    res.status(400).json({
                        message: Messages.INPUT_NOT_VALID
                    })
                    return
                })
            }).catch(error => {
                res.status(400).json(error)
                return
            })
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }
    }

    getOrdersOfUser = (req: Request, res: Response, next: NextFunction) => {
        let { user } = req.query;

        if (!user) {
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
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
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            if (!user) {
                res.status(405).json({
                    message: OrderMessages.USER_NOT_FOUND
                })
                return
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
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                if (orders.length === 0) {
                    res.json({
                        message: OrderMessages.NO_ENTRIES_FOUND
                    })
                    return
                }

                res.json({
                    orders
                })
            })
        })
    }


    cancelOrder = (req: Request, res: Response, next: NextFunction) => {
        let { order } = req.body;

        if (!order) {
            res.status(400).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        try {
            this.Orders.findOne({ _id: new ObjectId(order) }).exec(async (err, _order) => {
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

                if (!order) {
                    res.status(405).json({
                        message: OrderMessages.NO_ORDER_EXIST
                    })
                    return
                }

                if (_order.status === OrderStatus.DELIVERED) {
                    res.status(400).json({
                        message: OrderMessages
                    })
                    return
                }

                _order.status = OrderStatus.CANCELLED;

                await _order.save()

                res.json({
                    message: OrderMessages.ORDER_CANCELLED
                })
            })
        } catch (error) {
            console.error(error);
            res.status(400).json({
                message: OrderMessages.NO_ORDER_EXIST
            })
        }
    }

}