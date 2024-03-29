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

const validateToken = async (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, '', 'Token validated, user authorized.');

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
    const network = getNetwork();

    try {
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

        return res.status(200).json(commonService.returnSuccess(network, 200, data));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to validate token: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    let { network } = req.body;

    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        bcryptjs.hash(password, 10, async (hashError, hash) => {
            if (hashError) {
                return res.status(401).json(commonService.returnError(network, 401, hashError));
            }

            const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

            // Usernames should be unique
            const users = await conn.User.find({ username }).exec();
            if (users.length >= 1) {
                const error = `There already exists another user with the same username "${username}". Please choose a different username.`;
                return res.status(401).json(commonService.returnError(network, 401, error));
            }
            const user = await new conn.User({
                _id: new mongoose.Types.ObjectId(),
                username,
                password: hash,
                accountType: config.user.freeAcountType,
                requests: {
                    today: 0,
                    all: 0,
                    exhaustedQuota: 0,
                    totalQuota: config.user.freeAccountQuota
                }
            }).save();
            const data = {
                user
            };
            return res.status(201).json(commonService.returnSuccess(network, 200, data));
        });
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to register user: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { username, password } = req.body;
    let { network } = req.body;

    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        const user = await conn.User.findOne({ username }).exec();

        bcryptjs.compare(password, user.password, (error, result) => {
            if (error) {
                logging.error(NAMESPACE, '', error.message, error);

                return res.status(401).json(commonService.returnError(network, 401, 'Password mismatch'));
            } else if (result) {
                signJWT(user, (err, token) => {
                    if (err) {
                        logging.error(NAMESPACE, '', 'Unable to sign token: ', err);

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
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to login user: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const paymentCreateTx = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;
    const username = authTokenDecoded.username;

    const network = config.blockchain.mainnet;

    try {
        const conn = connMainnet;

        const user = await conn.User.findOne({ username }).select('-password').exec();

        if (user.accountType !== config.user.premiumAccountType || !user.did) {
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
        user.save();
        return res.status(200).json(commonService.returnSuccess(config.blockchain.mainnet, 200, data));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to create payment tx: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const paymentSignTx = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;
    const username = authTokenDecoded.username;

    const network = config.blockchain.mainnet;

    const { txHash } = req.body;

    try {
        const conn = connMainnet;

        const user = await conn.User.findOne({ username }).select('-password').exec();

        if (user.accountType !== config.user.premiumAccountType || !user.did) {
            const error =
                'Error while trying to create a payment transaction because this account is not a premium account type. Please upgrade your account from free to premium first with /v1/eidSidechain/publish/didTx API endpoint and setting the flag "upgradeAccount" to true. You can then create a payment transaction with /v1/users/payment/createTx API endpoint before proceeding and finally this /v1/users/payment/signTx API endpoint to complete the order.';
            return res.status(401).json(commonService.returnError(config.blockchain.mainnet, 401, error));
        }

        // Retrieve the memo from the transaction
        const _result = await elaRpcService.getMemoFromTransaction(config.blockchain.mainnet, txHash);
        if (_result.error) {
            return res.status(404).json(commonService.returnError(config.blockchain.mainnet, 404, _result.error));
        }
        const memo = _result.data.memo;

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
        user.save();
        const data = {
            amountAdded: amount,
            newBalance: user.balance
        };
        return res.status(200).json(commonService.returnSuccess(config.blockchain.mainnet, 200, data));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to sign payment tx: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const costInUsd = 0.001;
        const [account, users] = await Promise.all([
            accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd),
            conn.User.find().select('-password').select('-balance').select('-orderId').exec()
        ]);
        if (account.error) {
            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
        }

        const data = {
            users,
            count: users.length
        };
        account.user.save();
        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get all users: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getNewUserStats = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const dateString = req.query.created ? req.query.created.toString() : 'today';
        let beginDate = commonFunction.getDateFromString(dateString);
        if (beginDate == null) {
            const error = 'Date can only be passed in the following format: [today|yesterday|all|YYYY-MM-DD]';
            return res.status(500).json(commonService.returnError(network, 500, error));
        }
        beginDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
        const endDate = new Date(`${beginDate.getUTCFullYear()}-${('0' + (beginDate.getUTCMonth() + 1)).slice(-2)}-${('0' + beginDate.getUTCDate()).slice(-2)}`);
        if (dateString === 'all') {
            beginDate = null;
        }
        endDate.setDate(endDate.getDate() + 1);

        let costInUsd = 0.001;
        if (dateString === 'all') {
            costInUsd = 0.01;
        }
        const [account, stats] = await Promise.all([accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd), userStats.getStats(network, beginDate, endDate)]);
        if (account.error) {
            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
        }

        if (stats.error !== null) {
            logging.error(NAMESPACE, '', 'Error while trying to get user stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        } else {
            const data = stats.data;
            account.user.save();
            return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
        }
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get new user stats: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

export default { validateToken, register, login, paymentCreateTx, paymentSignTx, getAllUsers, getNewUserStats };
