import * as express from 'express';
import * as bodyParser from 'body-parser'
import * as http from 'http'
import * as cors from 'cors';
import session = require('express-session');
import passport = require('passport');
import cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
import { DataBase } from "./";
import { Router } from './router';

// Server Running Port
const port = 80;

export class FoodFactory {
    // MongoDB Connection Manager
    database = new DataBase();
    // Express App
    app;

    constructor() {
        // .env File Include
        require('dotenv').config()
        // Initialize Express App
        this.app = express()
        // Inject Body Parser for Parsing JSON
        this.app.use(bodyParser.json())
        // Inject Body Parser for Parsing Form Data
        this.app.use(bodyParser.urlencoded({ extended: false }))
        // Enabale CORS
        this.app.use(cors())
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
                mongooseConnection:
                    this.database.getConnection(process.env['DEFAULT_DB_NAME'])
            })
        }));
        // Inject Passport on Express
        this.app.use(passport.initialize());
        // Initialize Passport session
        this.app.use(passport.session());
        // Food Factory Route Manager
        new Router(this.app)
    }
}

// Create Node.JS server with Express
http.createServer(new FoodFactory().app).listen(port);
// Log
console.log(`App Running!, Port: ${port}`)