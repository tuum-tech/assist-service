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

    const conn = connMainnet;

    const result: any = await rpcService
        .getTokenBalance(network, tokenAddress, walletAddress, false)
        .then((balanceResponse) => {
            if (balanceResponse.meta.message === 'OK') {
                const data = {
                    value: balanceResponse.data.value
                };
                const costInUsd = 0.001;
                accountFunction
                    .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                    .then((account) => {
                        if (account.error) {
                            return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                        }
                        account.user.save();
                        return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                    })
                    .catch((error) => {
                        logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                        return res.status(500).json(commonService.returnError(network, 500, error));
                    });
            } else {
                logging.error(NAMESPACE, `Error while getting balance of '${walletAddress}' for the token '${tokenAddress}': `, balanceResponse.error);
                return res.status(balanceResponse.meta.code).json(commonService.returnError(network, balanceResponse.meta.code, balanceResponse.error));
            }
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, 'Error while trying to get balance of an address: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

const getSupplyMtrl = async (req: Request, res: Response, next: NextFunction) => {
    // const authTokenDecoded = res.locals.jwt;

    const tokenAddress = '0x13c99770694f07279607a6274f28a28c33086424';

    const validQs = ['circulating', 'total', 'max'];
    let q = req.query.q ? req.query.q.toString() : 'circulating';
    if (!validQs.includes(q)) q = 'circulating';

    let network = req.query.network ? req.query.network.toString() : config.blockchain.chainEth;
    if (!config.blockchain.validChains.includes(network)) network = config.blockchain.chainEth;

    const conn = connMainnet;

    const result: any = await rpcService
        .getSupplyMtrl(network, tokenAddress, q)
        .then((totalSupplyResponse) => {
            return res.status(200).json(totalSupplyResponse.data.value);
        })
        .catch((error: any) => {
            logging.error(NAMESPACE, `Error while trying to get total supply of the token '${tokenAddress}': `, error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

export default {
    getTokenBalance,
    getSupplyMtrl
};
