import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import config from '../../config/config';
import logging from '../../config/logging';
import User from '../../models/user';
import signJWT from '../../functions/signJTW';

const NAMESPACE = 'Controller: User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    return res.status(200).json({
        _status: 'OK',
        message: 'Token validated'
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                _status: 'ERR',
                _error: {
                    code: 401,
                    message: hashError
                }
            });
        }

        const _user = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            password: hash,
            accountType: config.user.freeAcountType,
            requests: {
                freeEndpoints: {
                    today: 0,
                    all: 0,
                    dailyLimit: config.user.freeEndpointsDailyLimit
                },
                premiumEndpoints: {
                    today: 0,
                    all: 0,
                    dailyLimit: config.user.premiumEndpointsDailyLimit
                }
            }
        });

        return _user
            .save()
            .then((user) => {
                return res.status(201).json({
                    _status: 'OK',
                    user
                });
            })
            .catch((err) => {
                logging.error(NAMESPACE, 'Error while trying to register a new user: ', err);

                return res.status(500).json({
                    _status: 'ERR',
                    _error: {
                        code: 500,
                        message: err
                    }
                });
            });
    });
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { username, password } = req.body;

    User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({
                    _status: 'ERR',
                    _error: {
                        code: 401,
                        message: 'Unauthorized'
                    }
                });
            }

            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(401).json({
                        _status: 'ERR',
                        _error: {
                            code: 401,
                            message: 'Password Mismatch'
                        }
                    });
                } else if (result) {
                    signJWT(users[0], (_error, token) => {
                        if (_error) {
                            logging.error(NAMESPACE, 'Unable to sign token: ', _error);

                            return res.status(500).json({
                                _status: 'ERR',
                                _error: {
                                    code: 500,
                                    message: _error
                                }
                            });
                        } else if (token) {
                            // We don't want to show the password during login
                            const _user = JSON.parse(JSON.stringify(users[0]));
                            delete _user['password'];
                            return res.status(200).json({
                                _status: 'OK',
                                message: 'Auth successful',
                                token: token,
                                user: _user
                            });
                        }
                    });
                }
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while logging in: ', err);

            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            });
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                _status: 'OK',
                users,
                count: users.length
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to get all users: ', err);

            return res.status(500).json({
                _status: 'ERR',
                _error: {
                    code: 500,
                    message: err
                }
            });
        });
};

export default { validateToken, register, login, getAllUsers };
