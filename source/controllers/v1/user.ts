import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import signJWT from '../../functions/signJTW';
import accountFunction from '../../functions/account';
import userStats from '../../functions/stats/user';
import commonFunction from '../../functions/common';
import commonService from '../../services/v1/common';
import IUser from '../../interfaces/user';

const NAMESPACE = 'Controller: User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    let network = (): string => {
        let result = config.blockchain.mainnet;
        if (!req.query.network) {
            let { network } = req.body;
            result = network ? network : config.blockchain.mainnet;
        } else {
            result = req.query.network.toString();
        }
        return result;
    };

    let data = {
        message: 'Token validated'
    };
    return res.status(200).json(commonService.returnSuccess(network(), 200, data));
};

const register = (req: Request, res: Response, next: NextFunction) => {
    let { network, username, password } = req.body;

    network = network ? network : config.blockchain.mainnet;

    bcryptjs.hash(password, 10, (hashError, hash) => {
        if (hashError) {
            return res.status(401).json(commonService.returnError(network, 401, hashError));
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
                    let error = `There already exists another user with the same username "${username}". Please choose a different username.`;
                    return res.status(401).json(commonService.returnError(network, 401, error));
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
                            let data = {
                                user
                            };
                            return res.status(201).json(commonService.returnSuccess(network, 200, data));
                        })
                        .catch((error: any) => {
                            logging.error(NAMESPACE, 'Error while trying to register a new user: ', error);

                            return res.status(500).json(commonService.returnError(network, 500, error));
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

                    return res.status(401).json(commonService.returnError(network, 401, 'Password mismatch'));
                } else if (result) {
                    signJWT(user, (error, token) => {
                        if (error) {
                            logging.error(NAMESPACE, 'Unable to sign token: ', error);

                            return res.status(500).json(commonService.returnError(network, 500, error));
                        } else if (token) {
                            // We don't want to show the password during login
                            const _user = JSON.parse(JSON.stringify(user));
                            delete _user['password'];
                            let data = {
                                message: 'Auth successful',
                                token,
                                user: _user
                            };
                            return res.status(200).json(commonService.returnSuccess(network, 200, data));
                        }
                    });
                }
            });
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while logging in: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const result: any = conn.models.User.find()
        .select('-password')
        .exec()
        .then((users) => {
            let data = {
                users,
                count: users.length
            };
            accountFunction
                .handleAPILimit(conn, authTokenDecoded, true)
                .then((account) => {
                    if (account.error) {
                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    const user: IUser = account.user;
                    user.requests.premiumEndpoints.today += 1;
                    user.requests.premiumEndpoints.all += 1;
                    user.save();
                    return res.status(200).json(commonService.returnSuccess(network, 200, data));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to get all users: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getStats = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const dateString = req.query.created ? req.query.created.toString() : 'today';
    let beginDate = commonFunction.getDateFromString(dateString);
    if (beginDate == null) {
        let error = 'Date can only be passed in the following format: [today|yesterday|YYYY-MM-DD]';
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
    let endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
    if (dateString === 'today' || dateString === 'yesterday') {
        beginDate.setDate(beginDate.getDate() - 1);
    } else {
        endDate.setDate(endDate.getDate() + 1);
    }

    const result: any = userStats.getStats(network, beginDate, endDate).then((stats) => {
        if (stats.error !== null) {
            logging.error(NAMESPACE, 'Error while trying to get user stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            let data = stats.data;
            accountFunction
                .handleAPILimit(conn, authTokenDecoded, true)
                .then((account) => {
                    if (account.error) {
                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    const user: IUser = account.user;
                    user.requests.premiumEndpoints.today += 1;
                    user.requests.premiumEndpoints.all += 1;
                    user.save();
                    return res.status(200).json(commonService.returnSuccess(network, 200, data));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        }
    });

    return result;
};

export default { validateToken, register, login, getAllUsers, getStats };
