"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require("./");
/**
 * Definition for Core Router Manager
 * @exports Router
 * @access constructor
 * @classdesc Class for Managing All Sub Routes
 */
class Router {
    /**
     * Router initialization with Express
     * @param {Express} app
     */
    constructor(app) {
        // Authentication Middleware reference
        this.authMiddleware = new _1.AuthMiddleware();
        // Injection of Authentication Middleware
        app.use(this.authMiddleware.authenticate);
        // Session Routes 
        app.use('/auth', new _1.SessionRoutes().router);
        // Vendor Routes 
        app.use('/vendor', new _1.VendorsRoutes().router);
        // Ingredient Routes 
        app.use('/ingredient', new _1.IngredientsRoutes().router);
        // Food Routes 
        app.use('/food', new _1.FoodRoutes().router);
        // Order Routes 
        app.use('/order', new _1.OrderRoutes().router);
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map