import mongoose from 'mongoose';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcService from '../../services/v1/elaMainchainRpc';
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
            const checkHeightDone = conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.elaMainchain.name })
                .exec()
                .then((state) => {
                    const latestState =
                        state ||
                        new conn.models.LatestBlockchainState({
                            _id: new mongoose.Types.ObjectId(),
                            chain: config.blockchain.elaMainchain.name,
                            network,
                            extraInfo: {
                                rpcUrl,
                                backupRpcUrl
                            }
                        });
                    rpcService
                        .getBlockInfoByHeight(network, height)
                        .then((r: any) => {
                            return r.data.block;
                        })
                        .then((block: any) => {
                            latestState.height = height;
                            latestState.block = block;
                            latestState.save();
                        })
                        .catch((err: any) => {
                            logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
                            return false;
                        });
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to retrieve latest state of the blockchain from the database: ', err);
                    return false;
                });
            return checkHeightDone;
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
