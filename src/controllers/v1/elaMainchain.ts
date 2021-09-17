import { NextFunction, Request, Response } from 'express';
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
import rpcService from '../../services/v1/eidSidechainRpc';
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
            accountFunction
                .handleAPILimit(conn, authTokenDecoded, false)
                .then((account) => {
                    if (account.error) {
                        return res.status(401).json(commonService.returnError(network, account.retCode, account.error));
                    }
                    const user: IUser = account.user;
                    user.requests.premiumEndpoints.today += 1;
                    user.requests.premiumEndpoints.all += 1;
                    user.save().catch((error: any) => {
                        logging.error(NAMESPACE, 'Error while trying to get the latest block info: ', error);

                        return res.status(500).json(commonService.returnError(config.blockchain.mainnet, 500, error));
                    });
                    return res.status(200).json(commonService.returnSuccess(network, 200, data));
                })
                .catch((error) => {
                    logging.error(NAMESPACE, 'Error while trying to verify account API limit', error);

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
