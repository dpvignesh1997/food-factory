"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const MongoStore = require('connect-mongo')(session);
const _1 = require("./");
const router_1 = require("./router");
// Server Running Port
const port = 80;
class FoodFactory {
    constructor() {
        // MongoDB Connection Manager
        this.database = new _1.DataBase();
        // .env File Include
        require('dotenv').config();
        // Initialize Express App
        this.app = express();
        // Inject Body Parser for Parsing JSON
        this.app.use(bodyParser.json());
        // Inject Body Parser for Parsing Form Data
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // Enabale CORS
        this.app.use(cors());
        // Use of Cookies
        this.app.use(cookieParser());
        // Use of express session
        this.app.use(session({
            secret: process.env['SECRET'],
            cookie: {
                maxAge: this.database.setMaxAge(+process.env['EXPIRATION'], 60, 60),
                secure: true
            },
            resave: false,
            saveUninitialized: true,
            store: new MongoStore({
                mongooseConnection: this.database.getConnection(process.env['DEFAULT_DB_NAME'])
            })
        }));
        // Inject Passport on Express
        this.app.use(passport.initialize());
        // Initialize Passport session
        this.app.use(passport.session());
        // Food Factory Route Manager
        new router_1.Router(this.app);
    }
}
exports.FoodFactory = FoodFactory;
// Create Node.JS server with Express
http.createServer(new FoodFactory().app).listen(port);
// Log
console.log(`App Running!, Port: ${port}`);
//# sourceMappingURL=app.js.map