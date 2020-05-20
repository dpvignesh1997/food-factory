import {
    SessionRoutes,
    AuthMiddleware,
    VendorsRoutes,
    IngredientsRoutes,
    FoodRoutes,
    OrderRoutes
} from './'

/**
 * Definition for Core Router Manager
 * @exports Router
 * @access constructor
 * @classdesc Class for Managing All Sub Routes
 */
export class Router {
    // Authentication Middleware reference
    authMiddleware = new AuthMiddleware()

    /**
     * Router initialization with Express
     * @param {Express} app 
     */
    constructor(app) {
        // Injection of Authentication Middleware
        app.use(this.authMiddleware.authenticate);
        // Session Routes 
        app.use('/auth', new SessionRoutes().router);
        // Vendor Routes 
        app.use('/vendor', new VendorsRoutes().router);
        // Ingredient Routes 
        app.use('/ingredient', new IngredientsRoutes().router);
        // Food Routes 
        app.use('/food', new FoodRoutes().router);
        // Order Routes 
        app.use('/order', new OrderRoutes().router);
    }
}