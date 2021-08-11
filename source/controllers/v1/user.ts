import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import signJWT from '../../functions/signJTW';

const NAMESPACE = 'Controller: User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    const network = req.query.network ? req.query.network : config.blockchain.mainnet;

    return res.status(200).json({
        _status: 'OK',
        network,
        message: 'Token validated'
    });
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { network, username, password } = req.body;

    network = network ? network : config.blockchain.mainnet;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json({
                _status: 'ERR',
                network,
                _error: {
                    code: 401,
                    message: hashError
                }
            });
        }

        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        // Usernames should be unique
        conn.models.User.find({ username })
            .exec()
            .then((users: any) => {
                if (users.length >= 1) {
                    return true;
                } else {
                    return false;
                }
            })
            .then((userExists: boolean) => {
                if (userExists) {
                    return res.status(401).json({
                        _status: 'ERR',
                        network,
                        _error: {
                            code: 401,
                            message: `There already exists another user with the same username "${username}". Please choose a different username.`
                        }
                    });
                } else {
                    let _user = new conn.models.User({
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
                                dailyLimit: network === config.blockchain.testnet ? config.user.freeEndpointsDailyLimit : config.user.premiumEndpointsDailyLimit
                            }
                        }
                    });

                    return _user
                        .save()
                        .then((user: any) => {
                            return res.status(201).json({
                                _status: 'OK',
                                network,
                                user
                            });
                        })
                        .catch((err: any) => {
                            logging.error(NAMESPACE, 'Error while trying to register a new user: ', err);

                            return res.status(500).json({
                                _status: 'ERR',
                                network,
                                _error: {
                                    code: 500,
                                    message: err
                                }
                            });
                        });
                }
            });
    });
};

const login = (req: Request, res: Response, next: NextFunction) => {
    let { network, username, password } = req.body;

    network = network ? network : config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    conn.models.User.findOne({ username })
        .exec()
        .then((user) => {
            bcryptjs.compare(password, user.password, (error, result) => {
                if (error) {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(401).json({
                        _status: 'ERR',
                        network,
                        _error: {
                            code: 401,
                            message: 'Password Mismatch'
                        }
                    });
                } else if (result) {
                    signJWT(user, (_error, token) => {
                        if (_error) {
                            logging.error(NAMESPACE, 'Unable to sign token: ', _error);

                            return res.status(500).json({
                                _status: 'ERR',
                                network,
                                _error: {
                                    code: 500,
                                    message: _error
                                }
                            });
                        } else if (token) {
                            // We don't want to show the password during login
                            const _user = JSON.parse(JSON.stringify(user));
                            delete _user['password'];
                            return res.status(200).json({
                                _status: 'OK',
                                network,
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
                network,
                _error: {
                    code: 500,
                    message: err
                }
            });
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    const network = req.query.network ? req.query.network : config.blockchain.mainnet;
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    conn.models.User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                _status: 'OK',
                network,
                users,
                count: users.length
            });
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to get all users: ', err);

            return res.status(500).json({
                _status: 'ERR',
                network,
                _error: {
                    code: 500,
                    message: err
                }
            });
        });
};

export default { validateToken, register, login, getAllUsers };
