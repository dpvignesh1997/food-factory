import { hashSync, compareSync } from "bcrypt";
import { AES, enc } from "crypto-js";

// Salting Rounds for Bcrypt
const saltRounds = 11;

/**
 * Definition for Authentication service
 * @extends AuthenticationService
 * @access contructor
 * @classdesc Class for Password & Token encryption
 */
export class AuthenticationService {
    // Secret Token for encryption
    secret = process.env['SECRET'];

    constructor() { }

    /**
     * Password Encryption
     * @param {String} password
     * @returns {string} 
     */
    async bcrypt(password: string) {
        return await hashSync(password, saltRounds);
    }

    /**
     * Compare Password Hash
     * @param {String} password 
     * @param {String} hash
     * @returns {Boolean}
     */
    async compareHash(password: string, hash: string) {
        return await compareSync(password, hash);
    }

    /**
     * Token Generation for Session management
     * @param {String} password 
     * @returns {String}
     */
    async encrypt(password: string) {
        return await AES.encrypt(password, this.secret).toString()
    }

    /**
     * Decrypt Generated Token for Session
     * @param {String} hash 
     * @returns {String}
     */
    async decrypt(hash: string) {
        return await AES.decrypt(hash, this.secret).toString(enc.Utf8)
    }
}