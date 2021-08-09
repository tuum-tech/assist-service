import mongoose from 'mongoose';
import cron from 'node-cron';
import config from '../../config/config';
import logging from '../../config/logging';
import User from '../../models/user';
import DidTx from '../../models/didTx';
import LatestBlockchainState from '../../models/latestBlockchainState';
import rpcService from '../../services/v1/eidSidechainRpc';

const NAMESPACE = 'Cron: EID Sidechain';

const Web3 = require('web3');

function publishDIDTx() {
    logging.info(NAMESPACE, 'Started cronjob: publishDIDTx');

    let web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);

    rpcService
        .getBlockHeight()
        .then((heightResponse) => {
            let currentHeight: number = heightResponse.height - 1;
            return currentHeight;
        })
        .then((height) => {
            let checkHeightDone = LatestBlockchainState.findOne({ chain: config.blockchain.eidSidechain.name })
                .exec()
                .then((state) => {
                    let latestState =
                        state ||
                        new LatestBlockchainState({
                            _id: new mongoose.Types.ObjectId(),
                            chain: config.blockchain.eidSidechain.name,
                            network: 'mainnet',
                            extraInfo: {
                                rpcUrl: config.blockchain.eidSidechain.rpcUrl,
                                contractAddress: config.blockchain.eidSidechain.contractAddress,
                                chainId: config.blockchain.eidSidechain.chainId
                            }
                        });
                    web3.eth
                        .getBlock(height)
                        .then((block: any) => {
                            return block;
                        })
                        .then((block: any) => {
                            latestState.height = height;
                            latestState.block = block;
                            latestState.save();
                        })
                        .catch((err: any) => {
                            logging.error(NAMESPACE, 'Error while getting the latest block from the blockchain: ', err);
                        });
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to retrieve latest state of the blockchain from the database: ', err);
                    return false;
                });
            return checkHeightDone;
        })
        .then((checkHeightDone) => {
            if (!checkHeightDone) {
                return false;
            }
            let pendingTxDone = DidTx.find({ status: 'Pending' })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx, index) => {
                        rpcService.sendTx(config.blockchain.eidSidechain.wallets.wallet1, JSON.stringify(didTx.didRequest), index).then((txDetails: any) => {
                            web3.eth.sendSignedTransaction(txDetails['rawTx']).on('transactionHash', (transactionHash: string) => {
                                didTx.status = 'Processing';
                                didTx.blockchainTxHash = transactionHash;
                                didTx.walletUsed = txDetails['walletUsed'];
                                didTx.save();
                            });
                        });
                    });
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while publishing the Pending DID transactions to the blockchain: ', err);
                    return false;
                });
            return pendingTxDone;
        })
        .then((pendingTxDone) => {
            if (!pendingTxDone) {
                return false;
            }
            let processingTxDone = DidTx.find({ status: 'Processing' })
                .exec()
                .then((didTxes) => {
                    didTxes.map((didTx) => {
                        web3.eth.getTransactionReceipt(didTx.blockchainTxHash).then((receipt: any) => {
                            if (!receipt) {
                                return;
                            }
                            didTx.blockchainTxReceipt = receipt;
                            if (receipt['status']) {
                                didTx.status = 'Completed';
                            } else {
                                didTx.status = 'Cancelled';
                                logging.error(NAMESPACE, 'Error while trying to publish DID transaction so changed its status to cancelled');
                            }
                            didTx.save();
                        });
                    });
                    return true;
                })
                .catch((err) => {
                    logging.error(NAMESPACE, 'Error while trying to process Processing DID transactions from the database: ', err);
                    return false;
                });
            return processingTxDone;
        })
        .then(() => {
            logging.info(NAMESPACE, 'Completed cronjob: publishDIDTx');
            setTimeout(publishDIDTx, 5000);
        })
        .catch((err) => {
            logging.error(NAMESPACE, 'Error while trying to run the cronjob to publish DID txes: ', err);
        });
}

function dailyCronjob() {
    // TODO: Uncomment this when going to production
    //cron.schedule('0 0 * * * *', () => {

    cron.schedule('*/5 * * * * *', () => {
        logging.info(NAMESPACE, 'Started cronjob: dailyCronjob');

        let web3 = new Web3(config.blockchain.eidSidechain.rpcUrl);

        User.find()
            .select('-password')
            .exec()
            .then((users) => {
                users.map((user) => {
                    user.requests.freeEndpoints.today = 0;
                    user.requests.premiumEndpoints.today = 0;
                    user.save();
                });
            })
            .catch((err) => {
                logging.error(NAMESPACE, 'Error while trying to reset daily limit for the users: ', err);
            });

        logging.info(NAMESPACE, 'Completed cronjob: dailyCronjob');
    });
}

export default { publishDIDTx, dailyCronjob };
