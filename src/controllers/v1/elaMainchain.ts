import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import accountFunction from '../../functions/account';
import commonService from '../../services/v1/common';
import IUser from '../../interfaces/user';

const NAMESPACE = 'Controller: ELA Mainchain';

const getBlockInfoLatest = (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    const result: any = conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name })
        .exec()
        .then((data) => {
            const costInUsd = 0.001;
            accountFunction
                .handleAPIQuota(conn, authTokenDecoded, costInUsd)
                .then((account) => {
                    if (account.error) {
                        return res.status(account.retCode).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    return res.status(200).json(commonService.returnSuccess(network, 200, data, account.quota));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API quota', error);

                    return res.status(500).json(commonService.returnError(network, 500, error));
                });
        })
        .catch((error) => {
            logging.error(NAMESPACE, 'Error while trying to get the latest block info: ', error);

            return res.status(500).json(commonService.returnError(network, 500, error));
        });
    return result;
};

export default {
    getBlockInfoLatest
};
