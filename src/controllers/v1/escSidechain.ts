import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import accountFunction from '../../functions/account';
import commonService from '../../services/v1/common';
import rpcServiceEvm from '../../services/v1/evmRpc';
import IUser from '../../interfaces/user';

const NAMESPACE = 'Controller: ESC Sidechain';

const getBlockInfoLatest = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const costInUsd = 0.001;
        const [account, data] = await Promise.all([
            accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd),
            conn.LatestBlockchainState.findOne({ chain: config.blockchain.escSidechain.name })
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
            rpcServiceEvm.getTokenBalance(config.blockchain.chainEsc, tokenAddress, walletAddress, isTestnet)
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
    getBlockInfoLatest,
    getTokenBalance
};
