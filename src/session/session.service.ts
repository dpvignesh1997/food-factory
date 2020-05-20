import { Request, Response, NextFunction } from 'express';
import { Model, Document } from "mongoose";
import {
    UserModel,
    userInterface,
    userStatus,
    UserSchemaValidator,
    Messages,
    AuthenticationService,
    TokenModel,
    tokenStatus,
    tokenInterface,
    UserLogModel,
    userLogInterface,
    userLogStatus,
    Mailer
} from "..";
import moment = require('moment');

/**
 * Definition for Session management
 * @exports Session
 * @access constructor
 * @classdesc class for SignIn, SignUp, Forgot Password, Change Password, Logout and Check for Email & Username Availability
 */
export class Session {
    // User model reference
    User: Model<userInterface> = new UserModel().getModel();
    // UserLog model reference
    UserLog: Model<userLogInterface> = new UserLogModel().getModel();
    // Token model reference
    Token: Model<tokenInterface> = new TokenModel().getModel();
    // AuthenticationService reference
    authService = new AuthenticationService();
    // Node Mailer reference
    mailer = new Mailer()

    // RegExp to check if a string is Email type 
    re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


    constructor() { }

    /**
     * SignUp Request Route
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (username, password, email, first_name, last_name)
     * @returns {JSON} res
     */
    signup = async (req: Request, res: Response, next: NextFunction) => {

        // Parse Username, email, Password, first_name, last_name from Request Body (Form Data)
        let { username, password, email, first_name, last_name } = req.body;

        try {
            await UserSchemaValidator.validateAsync({
                username,
                password,
                email,
                first_name,
                last_name: last_name ? last_name : ''
            })
        } catch (error) {
            /**
             * If provided Email is not valid
             * @return {Response}
             * @status {INVALID INPUT} 405
             * @message Provided Input is not valid!
             * @responsetype {JSON}
             */
            console.error(error);
            res.status(405).json({
                message: Messages.INPUT_NOT_VALID
            })
            return
        }

        // Change Username to Lowercase
        username = username.toLowerCase();
        // Change Email to Lowercase
        email = email.toLowerCase();

        /**
         * Check if User already exist with email
         * @param {String} email
         * @callback (Error, Document<userInterface>) -> (err, userWithEmail)
         */
        this.User.findOne({ email }).exec((err, userWithEmail) => {

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

            /**
             * If User already exist with Email
             * @return {Response} 
             * @status {INVALID INPUT} 405
             * @message Email already exist!
             * @responsetype {JSON}
             */
            if (userWithEmail) {
                res.status(405).json({
                    message: Messages.EMAIL_EXIST
                })
                return
            }

            /**
             * Check if User already exist with username
             * @param {String} username
             * @callback (Error, Document<userInterface>) -> (err, userwithUsername)
             */
            this.User.findOne({ username }).exec(async (err, userwithUsername) => {

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

                /**
                 * If User already exist with Username
                 * @return {Response}
                 * @status {NOT ACCEPTED} 406
                 * @message Username already exist!
                 * @responsetype {JSON}
                 */
                if (userwithUsername) {
                    res.status(406).json({
                        message: Messages.USERNAME_EXIST
                    })
                    return
                }

                /**
                 * Password Encryption
                 * @param {String} password
                 * @return {String} 
                 * */
                password = await this.authService.bcrypt(password)

                /**
                 * Create User
                 * @param {Document<userInterface>} user
                 * @return {Document<userInterface>}
                 * */
                let user: Document = new this.User({
                    username,
                    password,
                    email,
                    first_name,
                    last_name: last_name ? last_name : ''
                })

                // Save User
                user.save(async (err, user) => {
                    /**
                     * If error in Creating User
                     * @return {Response}
                     * @status {BAD REQUEST} 400
                     * @message Registration Failed!
                     * @responsetype {JSON}
                     */
                    if (err) {
                        console.log(err)
                        res.status(400).json({
                            message: Messages.SIGNUP_FAILED
                        })
                        return
                    }

                    /**
                     * Create User Log for Signup
                     * @param {Document<userLogInterface>}
                     * @return {Document}
                     */
                    await (new this.UserLog({
                        type: 'signup',
                        req_url: req.url,
                        req_method: req.method,
                        status: userLogStatus.SUCCESS,
                        user: user['_id']
                    })).save()

                    // Response on Successful User creation
                    res.status(200).json({
                        message: 'Registrated successfully!'
                    })
                })
            })
        })
    }

    /**
     * SignIn Request Route
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (username, password)
     * @returns {JSON} res
     */
    signin = (req: Request, res: Response, next: NextFunction) => {

        // Parse Username & Password from Request Body (Form Data)
        let { username, password } = req.body;

        // Change Username to Lowercase
        username = username ? username.toLowerCase() : '';

        // Check if Provided Username is type Email
        let isEmail = this.re.test(username)

        // Set Username Type for Find Query 
        let usernameType = isEmail ? 'email' : 'username';

        /**
         * Check if User already exist with username
         * @param {String} username
         * @callback (Error, Document<userInterface>) -> (err, user)
         */
        this.User.findOne({ [usernameType]: username, status: userStatus.ACTIVE })
            // Select username, email, password, avatar Columns
            .select('password email username avatar first_name last_name')
            .exec(async (error, user) => {
                /**
                 * If error in fetching User
                 * @return {Response}
                 * @status {INTERNAL SERVER ERROR} 500
                 * @message Internal Server Error!
                 * @responsetype {JSON}
                 */
                if (error) {
                    console.error(error);
                    res.status(500).json({
                        message: Messages.INTERNAL_SERVER_ERROR
                    })
                    return
                }

                /**
                 * If User not Found
                 * @return {Response}
                 * @status {NOT ACCEPTED} 406
                 * @message Username or Password is incorrect!
                 * @responsetype {JSON}
                 */
                if (!user) {
                    res.status(406).json({
                        message: Messages.USER_NOT_FOUND
                    })
                    return
                }

                /**
                 * Compare provided Password with exisitng Password
                 * @param {String} password
                 * @param {String} user.password
                 * @return {Boolean}
                 */
                let isPasswordValid = await this.authService.compareHash(password, user['password']);

                /**
                 * If Password does match
                 * @return {Response}
                 * @status {NOT ACCEPTED} 406
                 * @message Username or Password is incorrect!
                 * @responsetype {JSON}
                 */
                if (!isPasswordValid) {
                    res.status(406).json({
                        message: Messages.USER_NOT_FOUND
                    })
                    return
                }

                // Prepare Session Token Payload
                let payload = {
                    email: user['email'],
                    username: user['username'],
                    avatar: user['avatar']
                }

                /**
                 * Encrypt Token Payload
                 * @param {String} password
                 * @returns {String}
                 */
                let token = await this.authService.encrypt(JSON.stringify(payload))

                /**
                 * Save Token
                 * @param {Document}
                 */
                let token_: Document = new this.Token({
                    token,
                    details: payload,
                    user: user['_id']
                })

                token_.save(async (err, token_saved) => {
                    /**
                     * If error in Creating Token
                     * @return {Response}
                     * @status {INTERNAL SERVER ERROR} 500
                     * @message Internal Server Error!
                     * @responsetype {JSON}
                     */
                    if (err) {
                        res.status(500).json({
                            message: Messages.INTERNAL_SERVER_ERROR
                        })
                        return
                    }

                    // Create User Log for Signin
                    await (new this.UserLog({
                        type: 'signin',
                        req_url: req.url,
                        req_method: req.method,
                        user: user['_id'],
                        token: token_saved['_id'],
                        status: userLogStatus.SUCCESS
                    })).save()

                    // Response on Successful Login
                    // res.json({
                    //     message: `Welcome ${user['first_name']} ${user['last_name']}`,
                    //     token,
                    //     user: payload
                    // })
                    res.send(token)
                })
            })
    }

    /**
     * Change Password Request Route
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (resetToken, password, confirmPassword)
     * @returns {JSON} res
     */
    changePassword = (req: Request, res: Response, next: NextFunction) => {
        let { resetToken, password, confirmPassword } = req.body;

        // Change Email to Lowercase && Validate Email
        if (!resetToken) {
            /**
             * If provided Email is not valid
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Email ID is not valid!
             * @responsetype {JSON}
             */
            res.status(400).json({
                message: Messages.CANT_PROCESS
            })
            return
        }

        // Check if Password & Confirm Password matches
        if (password !== confirmPassword) {
            /**
            * If User not found
            * @return {Response}
            * @status {NOT ACCEPTED} 406
            * @message Passwords does not match!
            * @responsetype {JSON}
            */
            res.status(406).json({
                message: Messages.PASSWORD_DOES_NOT_MATCH
            })
            return
        }

        this.User.findOne({
            password_reset_token: resetToken,
            password_reset_token_expiration: { $gte: moment.utc().toDate() }
        }).exec(async (err, user) => {
            /**
            * If error in fetching User
            * @return {Response}
            * @status {INTERNAL SERVER ERROR} 500
            * @message Internal Server Error!
            * @responsetype {JSON}
            */
            if (err) {
                res.status(500).json({
                    message: Messages.INTERNAL_SERVER_ERROR
                })
                return
            }

            /**
            * If User not found
            * @return {Response}
            * @status {NOT ACCEPTED} 406
            * @message Reset Passwword token is not valid!
            * @responsetype {JSON}
            */
            if (!user) {
                res.status(406).json({
                    message: Messages.RESET_PASSWORD_TOKEN_NOT_VALID
                })
                return
            }

            user.password = await this.authService.bcrypt(password);
            user.password_reset_token = null;
            user.password_reset_token_expiration = null;

            user.save((err, updatedUser) => {
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

                this.mailer.sendMail(
                    user.email,
                    `Password Reset Successful`,
                    'Password Reset',
                    []
                ).then(() => {
                    res.json({
                        message: Messages.CHANGE_PASSWORD
                    })
                }).catch(err => {
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
                    }
                })
            })
        })
    }

    /**
     * Change Password Request Route
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (email)
     * @returns {JSON} res
     */
    forgotPassword = (req: Request, res: Response, next: NextFunction) => {
        let { email } = req.body;

        // Change Email to Lowercase && Validate Email
        if (!email || !this.re.test(`${email}`.toLowerCase())) {
            /**
             * If provided Email is not valid
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Email ID is not valid!
             * @responsetype {JSON}
             */
            res.status(400).json({
                message: Messages.NOT_A_VALID_EMAIL
            })
            return
        }

        // Change Email to Lowercase
        email = `${email}`.toLowerCase();

        this.User.findOne({ email }).exec(async (err, user) => {
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

            /**
             * If User not found
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Email ID is not valid!
             * @responsetype {JSON}
             */
            if (!user) {
                res.status(400).json({
                    message: Messages.NOT_A_VALID_EMAIL
                })
                return
            }

            let _token = await this.authService.encrypt(user.email);

            user.password_reset_token = _token;
            user.password_reset_token_expiration = moment.utc().add(1, 'hour').toDate();

            user.save((err, userUpdated) => {
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

                this.mailer.sendMail(
                    user.email,
                    `Password Reset Token: ${_token}`,
                    'Password Reset',
                    []
                ).then(() => {
                    res.json({
                        message: Messages.FORGOT_PASSWORD
                    })
                }).catch(err => {
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
                    }
                })
            })
        })
    }

    /**
     * Logout
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (token)
     * @returns {JSON} res
     */
    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get Bearer Token from Request Headers 
            let token = req.headers.authorization.split(' ')[1];

            this.Token.findOne({
                token,
                expiration: { $gte: moment.utc().toDate() }
            }).exec((err, _token) => {
                /**
                 * If error in fetching Token
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

                /**
                 * If Token not Found
                 * @return {Response}
                 * @status {NOT AUTHORIZED} 401
                 * @message Not Authorized!
                 * @responsetype {JSON}
                 */
                if (!_token) {
                    res.status(401).json({
                        message: Messages.NO_AUTH
                    })
                    return
                }

                // Check if Token is Valid
                this.Token.updateOne({ token }, {
                    $set: {
                        expiration: moment.utc(),
                        status: tokenStatus.LOGOUT
                    }
                }).exec((err, tokenUpdated) => {
                    /**
                     * If error in Updating Token
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

                    // On Successful Update
                    res.json({
                        messsage: 'Successfully LoggedOut!'
                    })
                })
            })

        } catch (error) {
            /**
             * If error in parsing token from header
             * @return {Response}
             * @status {NOT AUTHORIZED} 401
             * @message Not Authorized!
             * @responsetype {JSON}
             */
            console.error(error);
            res.status(400).json({
                message: Messages.NO_AUTH
            })
        }
    }

    /**
     * Deactivate User
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (token)
     * @returns {JSON} res
     */
    deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get Bearer Token from Request Headers 
            let token = req.headers.authorization.split(' ')[1];

            this.Token.findOne({
                token,
                expiration: { $gte: moment.utc().toDate() }
            }).exec((err, token) => {
                /**
                 * If error in fetching Token
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

                /**
                 * If Token not Found
                 * @return {Response}
                 * @status {NOT AUTHORIZED} 401
                 * @message Not Authorized!
                 * @responsetype {JSON}
                 */
                if (!token) {
                    res.status(401).json({
                        message: Messages.NO_AUTH
                    })
                    return
                }

                // Check if Token is Valid
                this.User.updateOne({ _id: token.user }, {
                    $set: {
                        status: userStatus.DEACTIVATED
                    }
                }).exec((err, tokenUpdated) => {
                    /**
                     * If error in Updating Token
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

                    // On Successful Update
                    res.json({
                        messsage: Messages.USER_DEACTIVATED
                    })
                })
            })

        } catch (error) {
            /**
             * If error in parsing token from header
             * @return {Response}
             * @status {NOT AUTHORIZED} 401
             * @message Not Authorized!
             * @responsetype {JSON}
             */
            console.error(error);
            res.status(400).json({
                message: Messages.NO_AUTH
            })
        }
    }

    /**
     * Check Email Availablity
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (email)
     * @returns {JSON} res
     */
    checkEmailAvailablity = async (req: Request, res: Response, next: NextFunction) => {
        let { email } = req.body;

        // Change Email to Lowercase && Validate Email
        if (!email || !this.re.test(`${email}`.toLowerCase())) {
            /**
             * If provided Email is not valid
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Email ID is not valid!
             * @responsetype {JSON}
             */
            res.status(400).json({
                message: Messages.NOT_A_VALID_EMAIL
            })
            return
        }

        // Change Email to Lowercase
        email = `${email}`.toLowerCase();

        this.User.findOne({ email }).exec(async (err, user) => {
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

            /**
             * If User found
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Email already exist!
             * @responsetype {JSON}
             */
            if (user) {
                res.status(400).json({
                    message: Messages.EMAIL_EXIST
                })
                return
            }

            // If Email is available for Signup
            res.json({
                message: Messages.EMAIL_AVAILABLE
            })
        })
    }

    /**
     * Check Username Availablity
     * @method (POST)
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @requires (email)
     * @returns {JSON} res
     */
    checkUserNameAvailablity = async (req: Request, res: Response, next: NextFunction) => {
        let { username } = req.body;

        // If Username is Undefined or Null
        if (!username) {
            /**
             * If provided Username is not valid
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Username ID is not valid!
             * @responsetype {JSON}
             */
            res.status(400).json({
                message: Messages.NOT_A_VALID_USERNAME
            })
            return
        }

        // Change Username to Lowercase
        username = `${username}`.toLowerCase();

        this.User.findOne({ username }).exec(async (err, user) => {
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

            /**
             * If User found
             * @return {Response}
             * @status {BAD REQUEST} 400
             * @message Username already exist!
             * @responsetype {JSON}
             */
            if (user) {
                res.status(400).json({
                    message: Messages.USERNAME_EXIST
                })
                return
            }

            // If Username is available for Signup
            res.json({
                message: Messages.USERNAME_AVAILABLE
            })
        })
    }
}