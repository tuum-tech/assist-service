import { NextFunction, Request, Response } from 'express';
import config from '../../config/config';
import logging from '../../config/logging';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import accountFunction from '../../functions/account';
import commonService from '../../services/v1/common';
import rpcService from '../../services/v1/elaMainchainRpc';
import IUser from '../../interfaces/user';

const NAMESPACE = 'Controller: ELA Mainchain';

const getBlockInfoLatest = async (req: Request, res: Response, next: NextFunction) => {
    const authTokenDecoded = res.locals.jwt;

    let network = req.query.network ? req.query.network.toString() : config.blockchain.mainnet;
    if (!config.blockchain.validNetworks.includes(network)) network = config.blockchain.mainnet;

    try {
        const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

        const costInUsd = 0.001;
        const [account, data] = await Promise.all([
            accountFunction.handleAPIQuota(conn, authTokenDecoded, costInUsd),
            conn.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name })
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

const getSupplyEla = async (req: Request, res: Response, next: NextFunction) => {
    // const authTokenDecoded = res.locals.jwt;

    const validQs = ['circulating', 'total', 'max'];
    let q = req.query.q ? req.query.q.toString() : 'circulating';
    if (!validQs.includes(q)) q = 'circulating';

    const network = config.blockchain.mainnet;

    try {
        const conn = connMainnet;

        const data = await conn.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name });

        const currentHeight = data.height;
        const minedEla = 5.02283105 * currentHeight;
        const burnedEla = await rpcService.getBalance(network, 'ELANULLXXXXXXXXXXXXXXXXXXXXXYvs3rr');

        let elaAmount = 28220000;
        const totalSupply = 33000000 + minedEla - burnedEla.data.value;

        if (q === 'total') {
            elaAmount = totalSupply;
        } else if (q === 'circulating') {
            const crAssetsAddress = await rpcService.getBalance(network, 'CRASSETSXXXXXXXXXXXXXXXXXXXX2qDX5J');
            const crExpensesAddress = await rpcService.getBalance(network, 'CREXPENSESXXXXXXXXXXXXXXXXXX4UdT6b');
            const efAddress = await rpcService.getBalance(network, '8S7jTjYjqBhJpS9DxaZEbBLfAhvvyGypKx');
            const efOperationsAddress = await rpcService.getBalance(network, '8ZZLWQUDSbjWUn8sEdxEFJsZiRFpzg53rJ');
            const crGenesisAddress = await rpcService.getBalance(network, '8KNrJAyF4M67HT5tma7ZE4Rx9N9YzaUbtM');
            elaAmount = totalSupply - crAssetsAddress.data.value - crExpensesAddress.data.value - efAddress.data.value - efOperationsAddress.data.value - crGenesisAddress.data.value;
        }

        return res.status(200).json(elaAmount);
    } catch (error) {
        logging.error(NAMESPACE, '', 'Error while trying to get supply of ELA: ', error);
        return res.status(500).json(commonService.returnError(network, 500, error));
    }
};

export default {
    getBlockInfoLatest,
    getSupplyEla
};
