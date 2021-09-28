import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcService from '../../services/v1/elaMainchainRpc';
import externalService from '../../services/v1/external';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';

const NAMESPACE = 'Cron: ELA Mainchain';

function setLatestBlockInfo(network: string) {
    logging.info(NAMESPACE, `Started cronjob: setLatestBlockInfo: ${network}`);

    const rpcUrl = network === config.blockchain.testnet ? config.blockchain.elaMainchain.testnet.rpcUrl : config.blockchain.elaMainchain.mainnet.rpcUrl;
    const backupRpcUrl = network === config.blockchain.testnet ? config.blockchain.elaMainchain.testnet.backupRpcUrl : config.blockchain.elaMainchain.mainnet.backupRpcUrl;

    const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;

    rpcService
        .getBlockHeight(network)
        .then((heightResponse) => {
            const currentHeight: number = heightResponse.data.height - 1;
            return currentHeight;
        })
        .then((height) => {
            conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name })
                .exec()
                .then((state) => {
                    const latestState =
                        state ||
                        new conn.models.LatestBlockchainState({
                            _id: new mongoose.Types.ObjectId(),
                            chain: config.blockchain.elaMainchain.name,
                            network
                        });
                    externalService
                        .getELAPriceCoinGecko()
                        .then((rCoinGecko: any) => {
                            if (rCoinGecko.data) {
                                return rCoinGecko.data.elaPriceUsd;
                            } else {
                                const cmcPrice = externalService.getELAPriceCoinmarketcap().then((rCmc: any) => {
                                    if (rCmc.data) {
                                        return rCmc.data.elaPriceUsd;
                                    } else {
                                        return latestState.elaPriceUsd || 0;
                                    }
                                });
                                return cmcPrice;
                            }
                        })
                        .then((elaPriceUsd) => {
                            rpcService
                                .getBlockInfoByHeight(network, height)
                                .then((r: any) => {
                                    return r.data.block;
                                })
                                .then((block: any) => {
                                    latestState.height = height;
                                    latestState.block = block;
                                    latestState.miner = 'TBD';
                                    latestState.validator = {
                                        name: 'TBD',
                                        rank: Infinity,
                                        ownerKey: 'TBD',
                                        nodeKey: 'TBD',
                                        location: 'TBD',
                                        url: 'TBD',
                                        ip: 'TBD'
                                    };
                                    latestState.elaPriceUsd = elaPriceUsd;
                                    latestState.avgTxHourly = Infinity;
                                    latestState.accountsOverOneELA = Infinity;
                                    latestState.hashrate = 'TBD';
                                    latestState.numTx = block.tx.length;
                                    latestState.extraInfo = {
                                        rpcUrl,
                                        backupRpcUrl
                                    };
                                    latestState.save();
                                })
                                .catch((err: any) => {
                                    logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
                                    return false;
                                });
                        });
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to retrieve latest state of the blockchain from the database: ', err);
                });
        })
        .then(() => {
            logging.info(NAMESPACE, `Completed cronjob: setLatestBlockInfo: ${network}`);
            setTimeout(() => {
                setLatestBlockInfo(network);
            }, 60000);
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to run the cronjob to get latest block info: ', err);
        });
}

export default { setLatestBlockInfo };
