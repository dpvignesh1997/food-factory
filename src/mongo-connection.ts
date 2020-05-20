import { createConnection } from "mongoose";
import { MongoClient } from "mongodb";

/**
 * Definition for MongoDB Manager
 * @exports Router
 * @access constructor
 * @classdesc Class for Managing All MongoDB Connections
 */
export class DataBase {
    // HashMap for Connections
    connections = {}

    constructor() { }

    /**
     * Get Connection on Database
     * @param {String} dbName
     * @returns {MongoClient} connections 
     */
    getConnection(dbName: string) {
        /**
         * If Connection Already exists
         * @return {MongoClient}
         * else Create New Connection
         * @param {String} dbName
         * @return {MongoClient}
         */
        if (this.connections[dbName]) {
            return this.connections[dbName];
        } else {
            this.connections[dbName] = createConnection(process.env['DB_HOST'] + dbName, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true
            });
            return this.connections[dbName];
        }
    }

    // Max Age for Expirations
    setMaxAge(hours: number, minutes: number, seconds: number) {
        return hours * minutes * seconds * 1000
    }
}