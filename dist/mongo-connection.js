"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Definition for MongoDB Manager
 * @exports Router
 * @access constructor
 * @classdesc Class for Managing All MongoDB Connections
 */
class DataBase {
    constructor() {
        // HashMap for Connections
        this.connections = {};
    }
    /**
     * Get Connection on Database
     * @param {String} dbName
     * @returns {MongoClient} connections
     */
    getConnection(dbName) {
        /**
         * If Connection Already exists
         * @return {MongoClient}
         * else Create New Connection
         * @param {String} dbName
         * @return {MongoClient}
         */
        if (this.connections[dbName]) {
            return this.connections[dbName];
        }
        else {
            this.connections[dbName] = mongoose_1.createConnection(process.env['DB_HOST'] + dbName, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
            return this.connections[dbName];
        }
    }
    // Max Age for Expirations
    setMaxAge(hours, minutes, seconds) {
        return hours * minutes * seconds * 1000;
    }
}
exports.DataBase = DataBase;
//# sourceMappingURL=mongo-connection.js.map