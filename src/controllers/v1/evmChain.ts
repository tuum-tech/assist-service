import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import accountFunction from '../../functions/account';
import commonService from '../../services/v1/common';
import rpcService from '../../services/v1/evmRpc';

const NAMESPACE = 'Controller: EVM Chain';

const getTokenBalance = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    const { tokenAddress, walletAddress } = req.body;
    let { network } = req.body;
    network = network ? network : config.blockchain.chainEth;
    if (!config.blockchain.validChains.includes(network)) network = config.blockchain.chainEth;

    try {
        const conn = connMainnet;

        const costInUsd = 0.001;
        const [account, balanceResponse] = await Promise.all([
            accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd),
            rpcService.getTokenBalance(network, tokenAddress, walletAddress, false)
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

const getSupplyMtrl = async (req: Request, res: Response, next: NextFunction) => {
    // const authTokenDecoded = res.locals.jwt;

    const tokenAddress = '0x13c99770694f07279607a6274f28a28c33086424';

    const validQs = ['circulating', 'total', 'max'];
    let q = req.query.q ? req.query.q.toString() : 'circulating';
    if (!validQs.includes(q)) q = 'circulating';

    const network = config.blockchain.chainEth;

    // const conn = connMainnet;

    try {
        const totalSupplyResponse: any = await rpcService.getSupplyMtrl(network, tokenAddress, q);
        if (totalSupplyResponse.error) {
            logging.error(NAMESPACE, '', 'Error while trying to get supply of MTRL: ', totalSupplyResponse.error);
            return res.status(500).json(commonService.returnError(network, 500, totalSupplyResponse.error));
        }
        return res.status(200).json(totalSupplyResponse.data.value);
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get supply of MTRL: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

export default {
    getTokenBalance,
    getSupplyMtrl
};
