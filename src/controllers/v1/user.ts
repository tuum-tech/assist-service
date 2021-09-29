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
import elaRpcService from '../../services/v1/elaMainchainRpc';
import IUser from '../../interfaces/user';
import jwtDecode, { JwtPayload } from 'jwt-decode';

const NAMESPACE = 'Controller: User';

const validateToken = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Token validated, user authorized.');

    const token: string = req.headers.authorization?.split(' ')[1] || '';

    const getNetwork = (): string => {
        let result = config.blockchain.mainnet;
        if (!req.query.network) {
            const { network } = req.body;
            result = network ? network : config.blockchain.mainnet;
        } else {
            result = req.query.network.toString();
        }
        if (!config.blockchain.validNetworks.includes(result)) result = config.blockchain.mainnet;
        return result;
    };

    const decoded: any = jwtDecode<JwtPayload>(token);

    const data = {
        message: 'Token validated',
        decoded: {
            username: decoded.username,
            issuedDate: new Date(decoded.iat * 1000),
            expirationDate: new Date(decoded.exp * 1000),
            issuer: decoded.iss
        }
    };

    return res.status(200).json(commonService.returnSuccess(getNetwork(), 200, data));
};

const register = (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    let { network } = req.body;

    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

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
                    const error = `There already exists another user with the same username "${username}". Please choose a different username.`;
                    return res.status(401).json(commonService.returnError(network, 401, error));
                } else {
                    const _user = new conn.models.User({
                        _id: new mongoose.Types.ObjectId(),
                        username,
                        password: hash,
                        accountType: config.user.freeAcountType.name,
                        requests: {
                            totalAPICalls: 0,
                            freeEndpoints: {
                                today: 0,
                                all: 0,
                                dailyQuota: network === config.blockchain.testnet ? config.user.premiumAccountType.freeEndpointsDailyQuota : config.user.freeAcountType.freeEndpointsDailyQuota
                            },
                            premiumEndpoints: {
                                today: 0,
                                all: 0,
                                dailyQuota: network === config.blockchain.testnet ? config.user.premiumAccountType.premiumEndpointsDailyQuota : config.user.freeAcountType.premiumEndpointsDailyQuota
                            }
                        }
                    });

                    return _user
                        .save()
                        .then((user: any) => {
                            const data = {
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
    const { username, password } = req.body;
    let { network } = req.body;

    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
    conn.models.User.findOne({ username })
        .exec()
        .then((user) => {
            bcryptjs.compare(password, user.password, (error, result) => {
                if (error) {
                    logging.error(NAMESPACE, error.message, error);

                    return res.status(401).json(commonService.returnError(network, 401, 'Password mismatch'));
                } else if (result) {
                    signJWT(user, (err, token) => {
                        if (err) {
                            logging.error(NAMESPACE, 'Unable to sign token: ', err);

                            return res.status(500).json(commonService.returnError(network, 500, err));
                        } else if (token) {
                            // We don't want to show the password during login
                            const _user = JSON.parse(JSON.stringify(user));
                            delete _user.password;
                            delete _user.orderId;
                            const data = {
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

const paymentCreateTx = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;
    const username = authTokenDecoded.username;

    const conn = connMainnet;

    const result: any = conn.models.User.findOne({ username })
        .select('-password')
        .exec()
        .then((user: IUser) => {
            if (user.accountType !== config.user.premiumAccountType.name || !user.did) {
                const error =
                    'Error while trying to create a payment transaction because this account is not a premium account type. Please upgrade your account from free to premium first with /v1/eidSidechain/publish/didTx API endpoint and setting the flag "upgradeAccount" to true. You can rerun this API after the upgrade is complete.';
                return res.status(401).json(commonService.returnError(config.blockchain.mainnet, 401, error));
            }
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 5);
            const orderId = `assist-${Math.random().toString(36).substring(2, 11)}`;
            const data = {
                orderId,
                ELAAddress: config.server.paymentElaAddress,
                nextStep:
                    'Put the orderId as part of the memo using Essentials Wallet and send some ELA to the given address on the ELA mainchain, then proceed with the /v1/users/payment/signTx API endpoint to complete the transaction.'
            };
            user.orderId = orderId;
            user.save().catch((error: any) => {
                logging.error(NAMESPACE, 'Error while trying to create a payment order to top up the account: ', error);

                return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
            });
            return res.status(200).json(commonService.returnSuccess(config.blockchain.mainnet, 200, data));
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to create a payment order to top up the account: ', error);

            return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
        });
    return result;
};

const paymentSignTx = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;
    const username = authTokenDecoded.username;

    const { txHash } = req.body;

    const conn = connMainnet;

    const result: any = conn.models.User.findOne({ username })
        .select('-password')
        .exec()
        .then((user: IUser) => {
            if (user.accountType !== config.user.premiumAccountType.name || !user.did) {
                const error =
                    'Error while trying to create a payment transaction because this account is not a premium account type. Please upgrade your account from free to premium first with /v1/eidSidechain/publish/didTx API endpoint and setting the flag "upgradeAccount" to true. You can then create a payment transaction with /v1/users/payment/createTx API endpoint before proceeding and finally this /v1/users/payment/signTx API endpoint to complete the order.';
                return res.status(401).json(commonService.returnError(config.blockchain.mainnet, 401, error));
            }

            // Retrieve the memo from the transaction
            elaRpcService
                .getMemoFromTransaction(config.blockchain.mainnet, txHash)
                .then((r: any) => {
                    if (r.error) {
                        return res.status(404).json(commonService.returnError(config.blockchain.mainnet, 404, r.error));
                    }
                    const memo = r.data.memo;

                    // Check to see if orderId was included in the transaction memo
                    if (!(user.orderId && memo.message.includes(user.orderId))) {
                        const error =
                            'Error while trying to sign the payment transaction because the orderId could not be found. Please generate another orderId using /v1/users/payment/createTx API endpoint before proceeding';
                        return res.status(401).json(commonService.returnError(config.blockchain.mainnet, 401, error));
                    }

                    // Retrieve the ELA amount that was sent as part of the transaction
                    const amount: number = memo.amount;

                    user.balance += amount;
                    user.balance = Number(user.balance.toFixed(8));
                    user.orderId = '';
                    user.save().catch((error: any) => {
                        logging.error(NAMESPACE, 'Error while trying to sign the payment order to top up the account: ', error);

                        return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                    });
                    const data = {
                        amountAdded: amount,
                        newBalance: user.balance
                    };
                    return res.status(200).json(commonService.returnSuccess(config.blockchain.mainnet, 200, data));
                })
                .catch((error: any) => {
                    logging.error(NAMESPACE, 'Error while trying to get memo from the transaction: ', error);

                    return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                });
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to sign the payment order to top up the account: ', error);

            return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
        });
    return result;
};

const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const result: any = conn.models.User.find()
        .select('-password')
        .select('-balance')
        .select('-orderId')
        .exec()
        .then((users) => {
            const data = {
                users,
                count: users.length
            };
            const isPremiumEndpoint = true;
            const weight = 1;
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, isPremiumEndpoint, weight)
                .then((account) => {
                    if (account.error) {
                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to get all users: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getNewUserStats = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const dateString = req.query.created ? req.query.created.toString() : 'today';
    let beginDate = commonFunction.getDateFromString(dateString);
    if (beginDate == null) {
        const error = 'Date can only be passed in the following format: [today|yesterday|all|YYYY-MM-DD]';
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
    const endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
    if (dateString === 'today' || dateString === 'yesterday') {
        beginDate.setDate(beginDate.getDate() - 1);
    } else if (dateString === 'all') {
        beginDate = null;
    } else {
        endDate.setDate(endDate.getDate() + 1);
    }

    const result: any = userStats.getStats(network, beginDate, endDate).then((stats) => {
        if (stats.error !== null) {
            logging.error(NAMESPACE, 'Error while trying to get user stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            const data = stats.data;
            const isPremiumEndpoint = true;
            const weight = 0.5;
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, isPremiumEndpoint, weight)
                .then((account) => {
                    if (account.error) {
                        logging.error(NAMESPACE, 'Error while trying to get user stats: ', account.error);

                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        }
    });

    return result;
};

export default { validateToken, register, login, paymentCreateTx, paymentSignTx, getAllUsers, getNewUserStats };
