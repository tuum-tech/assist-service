import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config/config';
import logging from '../../config/logging';
import rpcServiceEvm from '../../services/v1/evmRpc';
import connMainnet from '../../connections/mainnet';
import connTestnet from '../../connections/testnet';
import Web3 from 'web3';

const NAMESPACE = 'Cron: ESC Sidechain';

async function setLatestBlockInfo(network: string) {
    // * * * * * * format = second minute hour dayofmonth month dayofweek
    cron.schedule(
        '*/10 * * * * *',
        async () => {
            logging.info(NAMESPACE, `Started cronjob: setLatestBlockInfo: ${network}`);

            const rpcUrl = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.rpcUrl : config.blockchain.escSidechain.mainnet.rpcUrl;
            const backupRpcUrl = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.backupRpcUrl : config.blockchain.escSidechain.mainnet.backupRpcUrl;
            const chainId = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.chainId : config.blockchain.escSidechain.mainnet.chainId;
            const genesisBlockHash = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.genesisBlockHash : config.blockchain.escSidechain.mainnet.genesisBlockHash;
            const depositAddress = network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.depositAddress : config.blockchain.escSidechain.mainnet.depositAddress;
            const withdrawContractAddress =
                network === config.blockchain.testnet ? config.blockchain.escSidechain.testnet.withdrawContractAddress : config.blockchain.escSidechain.mainnet.withdrawContractAddress;

            const web3 = new Web3(rpcUrl);

            const conn = network === config.blockchain.testnet ? connTestnet : connMainnet;
            const isTestnet = network === config.blockchain.testnet ? true : false;

            await rpcServiceEvm
                .getBlockHeight(config.blockchain.chainEsc, isTestnet)
                .then((heightResponse) => {
                    const currentHeight: number = heightResponse.data.height - 1;
                    return currentHeight;
                })
                .then((height) => {
                    conn.models.LatestBlockchainState.findOne({ chain: config.blockchain.escSidechain.name })
                        .exec()
                        .then((state) => {
                            const latestState =
                                state ||
                                new conn.models.LatestBlockchainState({
                                    _id: new mongoose.Types.ObjectId(),
                                    chain: config.blockchain.escSidechain.name,
                                    network
                                });
                            web3.eth
                                .getBlock(height)
                                .then((block: any) => {
                                    return block;
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
                                    latestState.avgTxHourly = Infinity;
                                    latestState.accountsOverOneELA = Infinity;
                                    latestState.numTx = block.transactions.length;
                                    latestState.extraInfo = {
                                        rpcUrl,
                                        backupRpcUrl,
                                        chainId,
                                        genesisBlockHash,
                                        depositAddress,
                                        withdrawContractAddress
                                    };
                                    latestState.save();
                                })
                                .catch((err: any) => {
                                    logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
                                });
                        })
                        .catch((err) => {
                            logging.error(NAMESPACE, 'Error while trying to retrieve latest state of the blockchain from the database: ', err);
                        });
                })
                .then(() => {
                    logging.info(NAMESPACE, `Completed cronjob: setLatestBlockInfo: ${network}`);
                })
                .catch((err: any) => {
                    logging.error(NAMESPACE, 'Error while trying to run the cronjob to get latest block details: ', err.toString());
                });
        },
        { timezone: 'Etc/UTC' }
    );
}

export default { setLatestBlockInfo };
