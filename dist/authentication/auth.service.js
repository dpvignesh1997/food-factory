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
const bcrypt_1 = require("bcrypt");
const crypto_js_1 = require("crypto-js");
// Salting Rounds for Bcrypt
const saltRounds = 11;
/**
 * Definition for Authentication service
 * @extends AuthenticationService
 * @access contructor
 * @classdesc Class for Password & Token encryption
 */
class AuthenticationService {
    constructor() {
        // Secret Token for encryption
        this.secret = process.env['SECRET'];
    }
    /**
     * Password Encryption
     * @param {String} password
     * @returns {string}
     */
    bcrypt(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.hashSync(password, saltRounds);
        });
    }
    /**
     * Compare Password Hash
     * @param {String} password
     * @param {String} hash
     * @returns {Boolean}
     */
    compareHash(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.compareSync(password, hash);
        });
    }
    /**
     * Token Generation for Session management
     * @param {String} password
     * @returns {String}
     */
    encrypt(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield crypto_js_1.AES.encrypt(password, this.secret).toString();
        });
    }
    /**
     * Decrypt Generated Token for Session
     * @param {String} hash
     * @returns {String}
     */
    decrypt(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield crypto_js_1.AES.decrypt(hash, this.secret).toString(crypto_js_1.enc.Utf8);
        });
    }
}
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=auth.service.js.map