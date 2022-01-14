import { NextFunction, request, Request, Response } from 'express';
import { Base64 } from 'js-base64';
import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import eidSidechainStats from '../../functions/stats/eidSidechain';
import commonFunction from '../../functions/common';
import accountFunction from '../../functions/account';
import commonService from '../../services/v1/common';
import rpcServiceEvm from '../../services/v1/evmRpc';
import IDidTx from '../../interfaces/didTx';

const NAMESPACE = 'Controller: EID Sidechain';

const publishDIDTx = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const { didRequest, memo, upgradeAccount } = req.body;
    let { network } = req.body;
    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        const costInUsd = 0.001;
        const account = accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd);

        let did: any = null;
        let didRequestPayload = didRequest.payload;
        didRequestPayload = JSON.parse(Base64.decode(didRequestPayload + '='.repeat(didRequestPayload.length % 4)));
        did = didRequestPayload.id.replace('did:elastos:', '').split('#')[0];

        const a = await account;
        if (Boolean(upgradeAccount) === true) {
            if (network === config.blockchain.mainnet) {
                if (a.user.accountType !== config.user.premiumAccountType) {
                    a.user.accountType = config.user.premiumAccountType;
                    a.user.requests.totalQuota = config.user.premiumAccountQuota;
                    a.user.did = did;
                    a.user.balance = 0;
                } else {
                    const errMessage = 'This account is already upgraded to premium account. Nothing to do';
                    logging.error(NAMESPACE, did, errMessage);
                }
            } else {
                const errMessage = 'The upgrade to premium feature is not available on the testnet';
                logging.error(NAMESPACE, did, errMessage);
            }
        }
        let requestFrom = {};
        if (a.user.did) {
            requestFrom = {
                username: a.user.username,
                did: a.user.did
            };
        } else {
            requestFrom = {
                username: a.user.username
            };
        }

        const didTx = await new conn.DidTx({
            _id: new mongoose.Types.ObjectId(),
            did,
            didRequest,
            requestFrom,
            memo,
            status: config.txStatus.pending
        }).save();
        const result = JSON.parse(JSON.stringify(didTx));
        result.confirmationId = result._id;
        const data = {
            didTx: result
        };
        a.user.save();
        return res.status(200).json(commonService.returnSuccess(network, 200, data, a.quota));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to publish the DID: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getAllDIDTxes = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const costInUsd = 0.1;
        const [account, didTxes] = await Promise.all([accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd), conn.DidTx.find().exec()]);
        if (account.error) {
            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
        }
        const data = {
            didTxes,
            count: didTxes.length
        };
        account.user.save();
        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get all the DID transactions: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getDIDTxFromConfirmationId = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const _id = req.params.confirmationId;
    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        const didTx = await conn.DidTx.findOne({ _id }).exec();
        const data = {
            didTx
        };
        return res.status(200).json(commonService.returnSuccess(network, 200, data));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get DID tx from a confirmation ID: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getDIDTxStats = async (req: Request, res: Response, next: NextFunction) => {
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
        const [account, stats] = await Promise.all([accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd), eidSidechainStats.getTxStats(network, beginDate, endDate)]);
        if (account.error) {
            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
        }
        if (stats.error !== null) {
            logging.error(NAMESPACE, '', 'Error while trying to get DID tx stats: ', stats.error);
            return res.status(500).json(commonService.returnError(network, 500, stats.error));
        }

        account.user.save();
        return res.status(200).json(commonService.returnSuccess(network, 200, stats.data, account.quota));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get DID tx stats: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getBlockInfoLatest = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const costInUsd = 0.001;
        const [account, data] = await Promise.all([
            accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd),
            conn.LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name }).exec()
        ]);
        if (account.error) {
            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
        }
        account.user.save();
        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get info from the latest block: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

const getTokenBalance = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const { tokenAddress, walletAddress } = req.body;
    let { network } = req.body;
    network = network ? network : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
        const isTestnet = network === config.blockchain.testnet ? true : false;

        const costInUsd = 0.001;
        const [account, balanceResponse] = await Promise.all([
            accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd),
            rpcServiceEvm.getTokenBalance(config.blockchain.chainEid, tokenAddress, walletAddress, isTestnet)
        ]);
        if (account.error) {
            logging.error(NAMESPACE, account.user.did, 'Error while trying to find the user in the database: ', account.error);
            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
        }
        if (balanceResponse.meta.message === 'OK') {
            const data = {
                value: balanceResponse.data.value
            };
            account.user.save();
            return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
        } else {
            logging.error(NAMESPACE, '', `Error while getting balance of '${walletAddress}' for the token '${tokenAddress}': `, balanceResponse.error);
            return res.status(balanceResponse.meta.code).json(commonService.returnError(network, balanceResponse.meta.code, balanceResponse.error));
        }
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get token balance of an address: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

export default {
    publishDIDTx,
    getAllDIDTxes,
    getDIDTxFromConfirmationId,
    getDIDTxStats,
    getBlockInfoLatest,
    getTokenBalance
};
